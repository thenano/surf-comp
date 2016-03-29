class Contest
  include Mongoid::Document

  field :date, type: Date
  field :allowed_divisions, type: Array

  embeds_many :divisions
end