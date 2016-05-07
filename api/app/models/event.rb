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

    update_attribute(:schedule, add_remaining_heats(division, *replace_and_remove_heats(removed_heats, added_heats))) if added_heats

    (added_heats.to_a.size - removed_heats.to_a.size)
  end

  def remove_athlete(athlete_id, division_id, heat_id)
    division = event_divisions.find(division_id)
    removed_heats, added_heats = division.remove_athlete(heat_id, athlete_id)

    update_attribute(:schedule, add_remaining_heats(division, *replace_and_remove_heats(removed_heats, added_heats))) if removed_heats

    (added_heats.to_a.size - removed_heats.to_a.size)
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
