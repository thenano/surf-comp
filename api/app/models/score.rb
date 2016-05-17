class Score < ApplicationRecord
  belongs_to :heat
  belongs_to :judge, class_name: User
  belongs_to :athlete, class_name: User

  validates_presence_of  :wave, :score
end
