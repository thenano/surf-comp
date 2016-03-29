class ScoreCard
  include Mongoid::Document

  embeds_many :athlete_results

  def result
    athlete_results.sort_by {|result| result.total} .reverse
  end
end