class EventSerializer < ActiveModel::Serializer
  attributes :id, :name, :date, :schedule
end
