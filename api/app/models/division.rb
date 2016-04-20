class Division < ApplicationRecord
  has_and_belongs_to_many :users
  has_many :heats, -> { order 'position' }

  HEAT_SIZE = 6
  ROUND_NAMES = %w(Final Semifinal Quarterfinal Round)

  def draw
    number_of_rounds = Math.log2((users.length.to_f / HEAT_SIZE)).ceil + 1

    round = 1
    remaining_athletes = users.length.to_f
    heat_position_offset = 0

    while number_of_rounds > 0 do
      round_name = ROUND_NAMES[number_of_rounds - 1]
      round_name += " #{round}" if (number_of_rounds - 1) > 2

      number_of_heats = (remaining_athletes / HEAT_SIZE).ceil
      number_of_heats.times { |heat_number| heats << Heat.new({round: round_name, position: heat_position_offset + heat_number}) }

      remaining_athletes /= 2.0
      heat_position_offset += 10
      number_of_rounds -= 1
      round += 1
    end

    number_of_heats = (users.length.to_f / HEAT_SIZE).ceil
    heat_cycle = (0...number_of_heats).cycle

    users.each { |athlete| heats[heat_cycle.next].users << athlete }
  end
end
