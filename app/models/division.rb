class Division
  include Mongoid::Document

  field :name, type: String

  embeds_many :heats
  has_and_belongs_to_many :athletes, inverse_of: nil
end