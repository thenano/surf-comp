class Tournament
  include Mongoid::Document

  field :date, type: Date
  field :name, type: String

  embeds_many :divisions
end
