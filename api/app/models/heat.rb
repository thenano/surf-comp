class Heat < ApplicationRecord
  belongs_to :division

  has_and_belongs_to_many :users, as: :athletes

  validates_presence_of :round, :time, :position
end
