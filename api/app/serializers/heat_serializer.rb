class HeatSerializer < ActiveModel::Serializer
  attributes :id, :round

  has_many :users
end