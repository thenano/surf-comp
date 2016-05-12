class Heat < ApplicationRecord
  serialize :scores

  belongs_to :event_division

  has_many :athlete_heats, -> { order 'position' }, dependent: :destroy
  has_many :athletes, through: :athlete_heats

  validates_presence_of :round, :position, :round_position

  def add_score!(judge_id:, athlete_id:, wave:, score:)
    athletes.find(athlete_id) # will raise record not found
    self.scores ||= {}
    self.scores[athlete_id] ||= {}
    self.scores[athlete_id][judge_id] ||= []
    self.scores[athlete_id][judge_id][wave] = score

    save!
  end

  def scores_for(judge_id)
    scores.map{ |id, scores|
      my_scores = scores.detect{|judge, scores| judge.eql?(judge_id)}
      [id, my_scores[1]] if my_scores
    }.compact.to_h
  end

  def result
    scores.map{|athlete_id, value| [athlete_id, value.values.sort_by(&:size).reverse.reduce(:zip).map(&average_score)]}
    .to_h
    .map { |athlete_id, waves|
      {athlete_id: athlete_id, total: waves.sort.reverse.slice(0, 2).reduce(:+).round(2), waves: waves}
    }
    .sort_by { |score| [-score[:total], *score[:waves].sort.reverse.map{|score| -score}] }
  end

  private
    def average_score
      -> (scores) {
        return scores unless scores.is_a? Array
        flat_scores = scores.flatten.compact
        return (flat_scores.reduce(:+) / flat_scores.size.to_f).round(2)
      }
    end
end
