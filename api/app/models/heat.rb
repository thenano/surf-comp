class Heat < ApplicationRecord
  serialize :scores

  belongs_to :event_division

  has_many :athlete_heats, -> { order 'position' }, dependent: :destroy
  has_many :athletes, through: :athlete_heats

  validates_presence_of :round, :position, :round_position

  def add_score(judge_id, athlete_id, wave, score)
    athletes.find(athlete_id) # will raise record not found
    self.scores ||= {}
    self.scores[judge_id] ||= {}
    self.scores[judge_id][athlete_id] ||= []
    self.scores[judge_id][athlete_id][wave] = score

    save!
  end
end
