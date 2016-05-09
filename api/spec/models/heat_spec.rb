require 'rails_helper'

RSpec.describe Heat, :type => :model do
  describe '#add_score' do
    let(:heat) {create(:heat, event_division: create(:event_division, event: create(:event), division: create(:division)))}

    it 'adds the score when there is none' do
      heat.athlete_heats.create(athlete: create(:user), position: 0)

      judge_id = :'2'
      athlete_id = :'1'
      wave = 3
      score = 7.5
      heat.add_score(judge_id, athlete_id, wave, score)

      expect(heat.scores).to eql({
          '2': {'1': [nil, nil, nil, 7.5]}
                                 })
    end
  end
end
