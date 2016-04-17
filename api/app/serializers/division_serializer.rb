class DivisionSerializer < ActiveModel::Serializer
  attributes :id, :name

  has_many :heats
end
