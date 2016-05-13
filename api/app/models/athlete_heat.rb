class AthleteHeat < ApplicationRecord
  belongs_to :heat
  belongs_to :athlete, class_name: User, foreign_key: 'user_id'

  validates_presence_of  :position
end
