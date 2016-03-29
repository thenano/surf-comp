class AthleteResult
  include Mongoid::Document

  field :scores, type: Array

  belongs_to :athlete

  def total
    scores.sort.reverse.take(2).reduce(:+)
  end
end