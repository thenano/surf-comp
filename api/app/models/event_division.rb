class EventDivision < ApplicationRecord
  belongs_to :event
  belongs_to :division

  has_and_belongs_to_many :users
  has_many :heats, -> { order 'round_position, position' }, dependent: :destroy

  HEAT_SIZE_SEED_CYCLES = {
    1 => [0],
    2 => [0, 1],
    3 => [0, 2, 1],
    4 => [0, 3, 2, 1],
    5 => [0, 4, 2, 3, 1],
    6 => [0, 5, 3, 2, 4, 1],
    7 => [0, 6, 4, 3, 2, 5, 1],
    8 => [0, 7, 4, 3, 2, 5, 6, 1]
  }
  HEAT_SIZE = 6
  ROUND_NAMES = %w(Final Semifinal Quarterfinal)

  def draw
    number_of_heats = (users.length.to_f / HEAT_SIZE).ceil
    number_of_rounds = Math.log2(number_of_heats).ceil
    create_rounds(0, number_of_rounds, users.length.to_f)

    heat_cycle = HEAT_SIZE_SEED_CYCLES[number_of_heats]
    heat_cycle = (heat_cycle + heat_cycle.reverse).cycle

    users.each do |user|
      heat = heats[heat_cycle.next]
      position = heat.athlete_heats.last ? heat.athlete_heats.last.position.next : 0
      heat.athlete_heats.create({athlete_id: user.id, position: position})
    end
  end

  def add_athlete(athlete)
    users << athlete
    round_1_heats = heats.where(round_position: 0).includes(:athletes)
    available_round_1_heat = round_1_heats.detect { |heat| heat.athletes.size < HEAT_SIZE }

    if available_round_1_heat.nil?
      number_of_rounds = Math.log2(users.size.to_f / HEAT_SIZE).ceil
      round_name = ROUND_NAMES[number_of_rounds] || 'Round 1'

      available_round_1_heat = heats.create({round: round_name, round_position: 0, position: round_1_heats.size})

      round_1_heats.update_all(round: round_name)

      removed_heats = heats.destroy(heats.where('round_position > 0'))
      added_heats = [available_round_1_heat] + create_rounds(1, (number_of_rounds - 1), users.length / 2.0)
    end

    position = ((0..5).to_a - available_round_1_heat.athlete_heats.map(&:position)).first || 0
    available_round_1_heat.athlete_heats.create({athlete_id: athlete.id, position: position})

    return removed_heats || [], added_heats || []
  end

  def remove_athlete(heat_id, athlete_id)
    users.delete(athlete_id)
    heat = heats.find(heat_id)
    heat.athletes.delete(athlete_id)

    if heat.athletes.empty?
      removed_heats, added_heats = remove_heat(heat)
    end

    return removed_heats || [], added_heats || []
  end

  def remove_heat(heat)
    removed_heats = heats.destroy(heat)

    number_of_rounds = Math.log2(users.size.to_f / HEAT_SIZE).ceil
    round_name = ROUND_NAMES[number_of_rounds] || 'Round 1'
    heats.where(round_position: 0).update_all(round: round_name)

    removed_heats += heats.destroy(heats.where('round_position > 0'))
    added_heats = create_rounds(1, (number_of_rounds - 1), users.size / 2.0)

    return removed_heats, added_heats
  end

  def end_heat(heat)
    heat.update_attribute(:time, Time.now)
    return if heat.round.eql?('Final')

    result = heat.result

    advances = result.slice(0, (heat.athletes.size/2.0).ceil)
    this_round = heats.where(round_position: heat.round_position)
    next_round = heats.where(round_position: heat.round_position.next)
    this_round_size = this_round.size

    next_round_order = HEAT_SIZE_SEED_CYCLES[next_round.size]
    next_round_cycle = next_round_order + next_round_order.reverse
    next_round_cycle += next_round_order.reverse + next_round_order if this_round_size % 2 === 0
    next_round_cycle = next_round_cycle.cycle

    this_round_seed = HEAT_SIZE_SEED_CYCLES[this_round_size][heat.position]

    this_round_seed.times{next_round_cycle.next}
    advances.each_with_index do |athlete_result, position|
      heat = next_round[next_round_cycle.next]
      heat.athlete_heats.create({athlete_id: athlete_result[:athlete_id], position: (this_round_seed + position * this_round_size)/ next_round.size})
      (this_round_size - 1).times{next_round_cycle.next}
    end
  end

  private
    def create_rounds(lower_round, number_of_rounds, remaining_athletes)
      new_heats = []
      (0..number_of_rounds).to_a.reverse.each do |upper_round|
        round_name = ROUND_NAMES[upper_round] || "Round #{lower_round.next}"

        number_of_heats = (remaining_athletes / HEAT_SIZE).ceil
        number_of_heats.times { |heat_number| new_heats << Heat.new({round: round_name, round_position: lower_round, position: heat_number}) }

        remaining_athletes /= 2
        lower_round += 1
      end
      heats << new_heats

      new_heats
    end

end
