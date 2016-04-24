class EventDivision < ApplicationRecord
  belongs_to :event
  belongs_to :division

  has_and_belongs_to_many :users
  has_many :heats, -> { order 'position' }, dependent: :destroy

  HEAT_SIZE = 6
  ROUND_NAMES = %w(Final Semifinal Quarterfinal)

  def draw
    number_of_heats = (users.length.to_f / HEAT_SIZE).ceil
    number_of_rounds = Math.log2(number_of_heats).ceil
    create_rounds(0, number_of_rounds, users.length.to_f)

    heat_cycle = (0...number_of_heats).cycle

    users.each { |athlete| heats[heat_cycle.next].users << athlete }
  end

  def add_athlete(athlete)
    users << athlete

    round_1_heats = heats.where('position < 10').includes(:users)
    available_round_1_heat = round_1_heats.detect { |heat| heat.users.size < HEAT_SIZE }

    if available_round_1_heat.nil?
      number_of_rounds = Math.log2(users.size.to_f / HEAT_SIZE).ceil
      round_name = ROUND_NAMES[number_of_rounds] || 'Round 1'

      available_round_1_heat = heats.create({round: round_name, position: round_1_heats.size})
      available_round_1_heat.users << athlete

      round_1_heats.update_all(round: round_name)

      heats.destroy(heats.where('position >= 10'))
      create_rounds(1, (number_of_rounds - 1), users.length / 2.0)
    else
      available_round_1_heat.users << athlete
    end
  end

  def remove_athlete(heat_id, athlete_id)
    users.delete(athlete_id)
    heat = heats.find(heat_id)
    heat.users.delete(athlete_id)

    if heat.users.empty?
      heats.destroy(heat)

      number_of_rounds = Math.log2(users.size.to_f / HEAT_SIZE).ceil
      round_name = ROUND_NAMES[number_of_rounds] || 'Round 1'
      heats.where('position < 10').update_all(round: round_name)

      heats.destroy(heats.where('position >= 10'))
      create_rounds(1, (number_of_rounds - 1), users.size / 2.0)
    end
  end

  private
  def create_rounds(lower_round, number_of_rounds, remaining_athletes)
    (0..number_of_rounds).to_a.reverse.each do |upper_round|
      round_name = ROUND_NAMES[upper_round] || "Round #{lower_round.next}"

      number_of_heats = (remaining_athletes / HEAT_SIZE).ceil
      number_of_heats.times { |heat_number| heats << Heat.new({round: round_name, position: (lower_round * 10) + heat_number}) }

      remaining_athletes /= 2
      lower_round += 1
    end
  end

end
