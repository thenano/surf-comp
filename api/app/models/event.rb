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

    bank1 = schedule[0]
    bank2 = schedule[1]

    if added_heats
      remaining_heats = []
      added_heats.each do |new_heat|
        replaced = removed_heats.find{ |heat| heat.round.eql?(new_heat.round) and heat.position.eql?(new_heat.position) }

        bank1[bank1.index(replaced.id)] = new_heat.id if replaced and bank1.index(replaced.id)
        bank2[bank2.index(replaced.id)] = new_heat.id if replaced and bank2.index(replaced.id)
        remaining_heats << new_heat unless replaced
      end

      remaining_heats.group_by(&:round_position).each do |round, round_heats|
        bank1_insert_index, bank2_insert_index, insert_index = find_insert_index_for_round(bank1, bank2, division, round)

        bank1_insert_index, bank2_insert_index, insert_index =
            find_insert_index_for_round(bank1, bank2, division, round - 1) unless insert_index

        new_round_heat_ids = round_heats.map(&:id)
        empty_insert = new_round_heat_ids.map{0}
        bank1.insert(insert_index.next, bank1_insert_index ? new_round_heat_ids : empty_insert).flatten!
        bank2.insert(insert_index.next, bank2_insert_index ? new_round_heat_ids : empty_insert).flatten!
      end
    end

    update_attribute(:schedule, [bank1, bank2])
  end

  private
    def find_insert_index_for_round(bank1, bank2, division, position)
      round_heat_ids = division.heats.where(round_position: position).map(&:id)
      bank1_insert_index = bank1.index((bank1 & round_heat_ids).last)
      bank2_insert_index = bank2.index((bank2 & round_heat_ids).last) unless bank1_insert_index
      insert_index = bank1_insert_index || bank2_insert_index

      return bank1_insert_index, bank2_insert_index, insert_index
    end
end
