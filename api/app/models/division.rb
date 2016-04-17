class Division < ApplicationRecord
  has_and_belongs_to_many :users, as: :athletes
  has_many :heats, -> { order 'position' }

  HEAT_SIZE = 6
  ROUND_NAMES = ['Final', 'Semifinal', 'Quarterfinal', 'Round 1']

  def draw
    last_rounds = []
    round = 0
    while 2**round * HEAT_SIZE < users.length do
      (2**round) .times { last_rounds.prepend Heat.new({round: ROUND_NAMES[round]}) }
      round += 1
    end

    first_round = []
    number_of_heats = (users.length.to_f / HEAT_SIZE).ceil
    number_of_heats.times { |heat_number| first_round << Heat.new({round: ROUND_NAMES[round], position: heat_number}) }

    heat_cycle = (0...number_of_heats).cycle

    users.each { |athlete| first_round[heat_cycle.next].users << athlete }

    last_rounds.each_with_index { |heat, index| heat.position = number_of_heats + index }

    heats << first_round + last_rounds
  end
end
