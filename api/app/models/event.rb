class Event < ApplicationRecord
  serialize :schedule

  has_many :event_divisions, dependent: :destroy

  def draw
    event_divisions.each(&:draw)
    update_attribute(:schedule, [event_divisions.map {|division| division.heats.map(&:id) }.flatten, []])
  end

  def add_athlete(athlete, division_id)
    division = event_divisions.find(division_id)
    removed_heats, added_heats = division.add_athlete(athlete)

    update_attribute(:schedule, add_remaining_heats(division, *replace_and_remove_heats(removed_heats, added_heats)))

    (added_heats.size - removed_heats.size)
  end

  def remove_athlete(athlete_id, division_id, heat_id)
    division = event_divisions.find(division_id)
    removed_heats, added_heats = division.remove_athlete(heat_id, athlete_id)

    update_attribute(:schedule, add_remaining_heats(division, *replace_and_remove_heats(removed_heats, added_heats)))

    (added_heats.size - removed_heats.size)
  end

  def remove_heat(division_id, heat_id)
    division = event_divisions.find(division_id)
    removed_heats, added_heats = division.remove_heat(heat_id)

    update_attribute(:schedule, add_remaining_heats(division, *replace_and_remove_heats(removed_heats, added_heats)))

    (added_heats.size - removed_heats.size)
  end

  def is_heat?(id)
    !id.nil? && id != 0
  end

  def upcoming_heats
    start_time = Time.new(date.year, date.month, date.day, 7, 0, 0)

    (0..current_schedule_index).each do |index|
      heat_start_time = heat_for_bank_and_index(0, index)&.start_time ||
          heat_for_bank_and_index(1, index)&.start_time

      start_time = heat_start_time || (start_time + 16.minutes)
    end

    bank_1 = schedule[0][current_schedule_index+1..-1] || []
    bank_2 = schedule[1][current_schedule_index+1..-1] || []
    bank_1_start_time = bank_2_start_time = start_time

    [
      bank_1.map { |index|
        heat = heat_for_bank_and_index(0, index)

        bank_1_start_time += 16.minutes
        heat&.start_time = bank_1_start_time

        heat
      },
      bank_2.map { |index|
        heat = heat_for_bank_and_index(1, index)

        bank_2_start_time += 16.minutes
        heat&.start_time = bank_2_start_time

        heat
      }
    ]
  end

  def previous_heats
    bank_1 = schedule[0][0..current_schedule_index] || []
    bank_2 = schedule[1][0..current_schedule_index] || []

    [
        bank_1.map { |index| heat_for_bank_and_index(0, index) },
        bank_2.map { |index| heat_for_bank_and_index(1, index) }
    ]
  end

  def heat_for_bank_and_index(bank, schedule_index)
    heat_id = schedule[bank][schedule_index]

    is_heat?(heat_id) ? Heat.find(heat_id) : nil
  end


  def current_heats
    [
      heat_for_bank_and_index(0, current_schedule_index),
      heat_for_bank_and_index(1, current_schedule_index),
    ]
  end

  private
    def replace_and_remove_heats(removed_heats, added_heats)
      bank1, bank2 = schedule

      remaining_heats = []
      added_heats.each do |new_heat|
        replaced = removed_heats.find { |heat| heat.round.eql?(new_heat.round) and heat.position.eql?(new_heat.position) }

        bank1[bank1.index(replaced.id)] = new_heat.id if replaced and bank1.index(replaced.id)
        bank2[bank2.index(replaced.id)] = new_heat.id if replaced and bank2.index(replaced.id)
        remaining_heats << new_heat unless replaced
      end

      removed_heats.each do |removed|
        delete_and_clear(bank1, bank2, removed.id)
        delete_and_clear(bank2, bank1, removed.id)
      end

      return bank1, bank2, remaining_heats
    end

    def delete_and_clear(bank1, bank2, removed_id)
      index = bank1.index(removed_id)
      bank1.delete_at(index) if index
      bank2.delete_at(index) if index and bank2[index].to_i == 0
    end

    def add_remaining_heats(division, bank1, bank2, remaining_heats)
      remaining_heats.group_by(&:round_position).each do |round, round_heats|
        bank1_insert_index, bank2_insert_index, insert_index = find_insert_index_for_round(bank1, bank2, division, round)

        bank1_insert_index, bank2_insert_index, insert_index =
            find_insert_index_for_round(bank1, bank2, division, round - 1) unless insert_index

        new_round_heat_ids = round_heats.map(&:id)
        empty_insert = new_round_heat_ids.map{0}
        bank1.insert(insert_index.next, bank1_insert_index ? new_round_heat_ids : empty_insert).flatten!
        bank2.insert(insert_index.next, bank2_insert_index ? new_round_heat_ids : empty_insert).flatten!
      end

      return bank1, bank2
    end

    def find_insert_index_for_round(bank1, bank2, division, position)
      round_heat_ids = division.heats.find_all{ |heat| heat.round_position.eql?(position) }.map(&:id)

      bank1_rounds_intersection = (bank1 & round_heat_ids).last
      bank1_insert_index = bank1.index(bank1_rounds_intersection) if bank1_rounds_intersection

      bank2_rounds_intersection = (bank2 & round_heat_ids).last
      bank2_insert_index = bank2.index(bank2_rounds_intersection) if bank2_rounds_intersection and !bank1_insert_index

      insert_index = bank1_insert_index || bank2_insert_index
      return bank1_insert_index, bank2_insert_index, insert_index
    end
end
