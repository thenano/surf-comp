class Division < ApplicationRecord
  has_and_belongs_to_many :users, as: :athletes
  has_many :heats

  HEAT_SIZE = 6

  def draw
    number_of_heats = (users.length.to_f / HEAT_SIZE).ceil
    number_of_heats.times { heats << Heat.new({name: 'Final'}) }

    heat_cycle = (0...number_of_heats).cycle

    users.each { |athlete| heats[heat_cycle.next].users << athlete }

    heats << Heat.new({name: 'Final'})
  end
end
