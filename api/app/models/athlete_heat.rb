class AthleteHeat < ApplicationRecord
  belongs_to :heat
  belongs_to :athlete, class_name: User

  validates_presence_of  :position
end
