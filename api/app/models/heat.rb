class Heat < ApplicationRecord
  belongs_to :event_division

  has_many :athlete_heats, -> { order 'position' }, dependent: :destroy
  has_many :athletes, through: :athlete_heats

  validates_presence_of :round, :position
end
