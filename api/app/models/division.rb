class Division < ApplicationRecord
  has_and_belongs_to_many :users
  has_many :heats, -> { order 'position' }, dependent: :destroy

  HEAT_SIZE = 6
  ROUND_NAMES = %w(Final Semifinal Quarterfinal)

  def draw
    number_of_heats = (users.length.to_f / HEAT_SIZE).ceil
    number_of_rounds = Math.log2(number_of_heats).ceil
    create_heat_draw(0, number_of_rounds, users.length.to_f)

    heat_cycle = (0...number_of_heats).cycle

    users.each { |athlete| heats[heat_cycle.next].users << athlete }
  end

  def add_athlete(athlete)
    users << athlete
    number_of_rounds = Math.log2(users.size.to_f / HEAT_SIZE).ceil

    round_name = ROUND_NAMES[number_of_rounds] || 'Round 1'

    round_1_heats = heats.where('position < 10').includes(:users)
    available_round_1_heat = round_1_heats.detect { |heat| heat.users.size < HEAT_SIZE } || heats.create({round: round_name, position: round_1_heats.size})
    available_round_1_heat.users << athlete

    round_1_heats.update_all(round: round_name)

    heats.destroy(heats.where('position >= 10'))
    create_heat_draw(1, (number_of_rounds - 1), users.length / 2.0)
  end

  private
    def create_heat_draw(lower_round, number_of_rounds, remaining_athletes)
      (0..number_of_rounds).to_a.reverse.each do |upper_round|
        round_name = ROUND_NAMES[upper_round] || "Round #{lower_round.next}"

        number_of_heats = (remaining_athletes / HEAT_SIZE).ceil
        number_of_heats.times { |heat_number| heats << Heat.new({round: round_name, position: (lower_round * 10) + heat_number}) }

        remaining_athletes /= 2
        lower_round += 1
      end
    end

end
