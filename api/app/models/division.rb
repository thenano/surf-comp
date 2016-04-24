class Division < ApplicationRecord
  has_many :users, through: :event_divisions
end
