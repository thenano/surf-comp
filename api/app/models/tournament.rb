class Tournament < ApplicationRecord
  has_many :divisions
  accepts_nested_attributes_for :divisions, reject_if: proc { |attributes| attributes['use'] == '0' }

  validates_presence_of :name, :date
end
