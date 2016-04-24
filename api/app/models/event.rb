class Event < ApplicationRecord
  serialize :schedule

  has_many :event_divisions
end
