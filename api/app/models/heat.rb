class Heat < ApplicationRecord
  belongs_to :event_division

  has_many :athlete_heats, -> { order 'position' }, dependent: :destroy
  has_many :athletes, through: :athlete_heats
  has_many :scores

  validates_presence_of :round, :position, :round_position

  def add_score!(score)
    athletes.find(score[:athlete_id]) # will raise record not found
    record = scores.where(athlete_id: score[:athlete_id], judge_id: score[:judge_id], wave: score[:wave])
                .first_or_create(score)

    record.update!(score: score[:score]) unless score[:score].nil?
    scores.destroy(record) if score[:score].nil?
  end

  def scores_for(judge_id)
    scores.where(judge_id: judge_id).group_by(&:athlete_id).map { |athlete_id, scores|
      [
          athlete_id,
          scores.inject([]) { |waves, score|
            waves[score.wave] = score.score
            waves
          }
      ]
    }.to_h
  end

  def result
    all_athletes = athletes.map{|athlete| [athlete.id, []]}.to_h

    merged_athletes = all_athletes.merge(
        scores.group_by(&:athlete_id).map { |athlete_id, scores|
          [
            athlete_id,
            scores.group_by(&:judge_id).values.map { |judge_scores|
              judge_scores.inject([]) { |waves, score|
                waves[score.wave] = score.score
                waves
              }
            }.sort_by(&:size).reverse.reduce(:zip).map(&average_score)
          ]
        }.to_h
    )

    merged_athletes.map { |athlete_id, waves|
      {athlete_id: athlete_id, total: waves.compact.sort.reverse.slice(0, 2).inject(0) { |s, r| r + s }.round(2) , waves: waves}
    }.sort_by { |score| [-score[:total], *score[:waves].compact.sort.reverse.map{|score| -score}] }
  end

  private
    def average_score
      -> (scores) {
        return scores unless scores.is_a? Array
        flat_scores = scores.flatten.compact
        return nil if flat_scores.empty?
        return (flat_scores.reduce(:+) / flat_scores.size.to_f).round(2)
      }
    end
end
