class Event < ApplicationRecord
  serialize :schedule

  has_many :event_divisions, dependent: :destroy

  def draw
    event_divisions.each(&:draw)
    update_attribute(:schedule, [event_divisions.map {|division| division.heats.map(&:id) }.flatten, []])
  end
end
