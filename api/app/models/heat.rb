class Heat < ApplicationRecord
  belongs_to :event_division

  has_and_belongs_to_many :users, as: :athletes

  validates_presence_of :round, :position
end
