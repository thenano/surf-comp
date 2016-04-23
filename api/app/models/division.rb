class Division < ApplicationRecord
  has_and_belongs_to_many :users
  has_many :heats, -> { order 'position' }, dependent: :destroy

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

  def add_athlete(athlete)
    athletes = users.length.to_f
    original_number_of_rounds = Math.log2(athletes / HEAT_SIZE).ceil
    number_of_rounds = Math.log2((athletes + 1) / HEAT_SIZE).ceil

    round_name = ROUND_NAMES[number_of_rounds] || 'Round 1'

    round_1_heats = heats.where('position < 10').includes(:users)
    available_round_1_heat = round_1_heats.detect { |heat| heat.users.size < HEAT_SIZE } || heats.create({round: round_name, position: round_1_heats.size})
    available_round_1_heat.users << athlete

    round_1_heats.update_all(round: round_name)

    unless number_of_rounds.eql?(original_number_of_rounds)
      heats.where('position >= 10').update_all('position = position + 10')

      round_name = ROUND_NAMES[number_of_rounds - 1] || 'Round 2'

      number_of_heats = ((athletes + 1) / 2 / HEAT_SIZE).ceil
      number_of_heats.times { |heat_number| heats << Heat.new({round: round_name, position: 10 + heat_number}) }
    end
  end
end
