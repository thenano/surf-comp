class Division < ApplicationRecord
  has_and_belongs_to_many :users
  has_many :heats, -> { order 'position' }

  HEAT_SIZE = 6
  ROUND_NAMES = %w(Final Semifinal Quarterfinal)

  def draw
    number_of_rounds = Math.log2((users.length.to_f / HEAT_SIZE)).ceil

    remaining_athletes = users.length.to_f
    heat_offset = 0

    (0..number_of_rounds).to_a.reverse.each_with_index do |upper_round, lower_round|
      round_name = ROUND_NAMES[upper_round] || "Round #{lower_round + 1}"

      number_of_heats = (remaining_athletes / HEAT_SIZE).ceil
      number_of_heats.times { |heat_number| heats << Heat.new({round: round_name, position: heat_offset + heat_number}) }

      remaining_athletes /= 2.0
      heat_offset += 10
    end

    number_of_heats = (users.length.to_f / HEAT_SIZE).ceil
    heat_cycle = (0...number_of_heats).cycle

    users.each { |athlete| heats[heat_cycle.next].users << athlete }
  end
end
