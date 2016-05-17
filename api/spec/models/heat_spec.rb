require 'rails_helper'

RSpec.describe Heat, :type => :model do
  describe '#add_score!' do
    let(:heat) { create(:heat_with_athletes) }

    it 'adds the score when there is none' do
      score = {
          judge_id: 2,
          athlete_id: 1,
          wave: 3,
          score: 7.5
      }
      heat.add_score!(score)

      expect(heat.scores.first.persisted?).to be_truthy
    end

    it 'updates an existing score' do
      score = {
          judge_id: 2,
          athlete_id: 1,
          wave: 3,
          score: 7.5
      }
      Score.create(score)
      heat.add_score!(score.merge({score: 8.25}))

      expect(heat.scores.all.size).to eql(1)
      expect(heat.scores.first.score).to eql(8.25)
    end

    it 'destroys an existing score if score is nil' do
      score = {
          judge_id: 2,
          athlete_id: 1,
          wave: 3,
          score: 7.5
      }
      Score.create(score)
      heat.add_score!(score.merge({score: nil}))

      expect(heat.scores.all.size).to eql(0)
    end

    it 'does not add a nil score' do
      score = {
          judge_id: 2,
          athlete_id: 1,
          wave: 3,
          score: nil
      }
      heat.add_score!(score)

      expect(heat.scores.all.size).to eql(0)
    end

    it 'does not add a duplicate score' do
      score = {
          judge_id: 2,
          athlete_id: 1,
          wave: 3,
          score: 7
      }
      Score.create(score)
      heat.add_score!(score)

      expect(heat.scores.all.size).to eql(1)
    end

    it 'raises an exception if athlete is not in the heat' do
      score = {
          judge_id: 2,
          athlete_id: 10,
          wave: 3,
          score: 7.5
      }
      expect { heat.add_score!(score) }.to raise_exception(ActiveRecord::RecordNotFound)
    end
  end

  describe '#scores_for' do
    let(:heat) { create(:heat_with_athletes) }

    it 'filters the judge specific scores' do
      [1, 2, 3.24, 1, 1, 2].each_with_index { |score, index| heat.scores.create({athlete_id: 1, judge_id: 4, wave: index, score: score}) }
      [1.5, 1.5, 3.55, 2, 1, 2].each_with_index { |score, index| heat.scores.create({athlete_id: 1, judge_id: 5, wave: index, score: score}) }
      [1.5, 1, 4.75, 1, 1.5, 2].each_with_index { |score, index| heat.scores.create({athlete_id: 1, judge_id: 6, wave: index, score: score}) }

      [3.55, 8, 4, 5.5].each_with_index { |score, index| heat.scores.create({athlete_id: 2, judge_id: 4, wave: index, score: score}) }
      [4.75, 8.5, 3.5, 6.5].each_with_index { |score, index| heat.scores.create({athlete_id: 2, judge_id: 5, wave: index, score: score}) }
      [3.25, 9, 3, 6].each_with_index { |score, index| heat.scores.create({athlete_id: 2, judge_id: 6, wave: index, score: score}) }

      [1, 1, 9, 3, 2].each_with_index { |score, index| heat.scores.create({athlete_id: 3, judge_id: 4, wave: index, score: score}) }
      heat.scores.create({athlete_id: 3, judge_id: 4, wave: 7, score: 5.55})
      [1.3, 1.25, 8.9, 3.75, 2.12].each_with_index { |score, index| heat.scores.create({athlete_id: 3, judge_id: 5, wave: index, score: score}) }
      [1.25, 1, 9, 3.5, 2.5].each_with_index { |score, index| heat.scores.create({athlete_id: 3, judge_id: 6, wave: index, score: score}) }

      expect(heat.scores_for(4)).to eql({
                                             1 => [1.0, 2.0, 3.24, 1.0, 1.0, 2.0],
                                             2 => [3.55, 8.0, 4.0, 5.5],
                                             3 => [1.0, 1.0, 9.0, 3.0, 2.0, nil, nil, 5.55]
                                         })
    end
  end

  describe '#result' do
    let(:heat) { create(:heat_with_athletes) }
    it 'ranks the athletes based on highest score' do
      heat.scores.create([
          {athlete_id: 1, judge_id: 10, wave: 0, score: 1},
          {athlete_id: 2, judge_id: 10, wave: 0, score: 3},
          {athlete_id: 3, judge_id: 10, wave: 0, score: 5},
          {athlete_id: 4, judge_id: 10, wave: 0, score: 2},
          {athlete_id: 5, judge_id: 10, wave: 0, score: 7},
          {athlete_id: 6, judge_id: 10, wave: 0, score: 4}
      ])

      expect(heat.result).to eql([
                                     {athlete_id: 5, total: 7.0, waves: [7.0]},
                                     {athlete_id: 3, total: 5.0, waves: [5.0]},
                                     {athlete_id: 6, total: 4.0, waves: [4.0]},
                                     {athlete_id: 2, total: 3.0, waves: [3.0]},
                                     {athlete_id: 4, total: 2.0, waves: [2.0]},
                                     {athlete_id: 1, total: 1.0, waves: [1.0]},
                                 ])
    end

    it 'calculates the result even with empty waves for one judge' do
      heat.scores.create([
                             {athlete_id: 2, judge_id: 6, wave: 0, score: 1},
                             {athlete_id: 2, judge_id: 6, wave: 3, score: 3},
                         ])

      expect(heat.result).to eql([
                                     {athlete_id: 2, total: 4.0, waves: [1.0, nil, nil, 3.0]},
                                     {athlete_id: 1, total: 0.0, waves: []},
                                     {athlete_id: 3, total: 0.0, waves: []},
                                     {athlete_id: 4, total: 0.0, waves: []},
                                     {athlete_id: 5, total: 0.0, waves: []},
                                     {athlete_id: 6, total: 0.0, waves: []},
                                 ])
    end

    it 'ranks the athletes based on the total highest score' do
      heat.scores.create([
        {athlete_id: 1, judge_id: 10, wave: 0, score: 1},
        {athlete_id: 1, judge_id: 10, wave: 1, score: 2},

        {athlete_id: 2, judge_id: 10, wave: 0, score: 3},
        {athlete_id: 2, judge_id: 10, wave: 1, score: 8},

        {athlete_id: 3, judge_id: 10, wave: 0, score: 5},
        {athlete_id: 3, judge_id: 10, wave: 1, score: 7},

        {athlete_id: 4, judge_id: 10, wave: 0, score: 2},
        {athlete_id: 4, judge_id: 10, wave: 1, score: 3},

        {athlete_id: 5, judge_id: 10, wave: 0, score: 7},

        {athlete_id: 6, judge_id: 10, wave: 0, score: 4.5},
        {athlete_id: 6, judge_id: 10, wave: 1, score: 4}
      ])

      expect(heat.result).to eql([
                                     {athlete_id: 3, total: 12.0, waves: [5.0, 7.0]},
                                     {athlete_id: 2, total: 11.0, waves: [3.0, 8.0]},
                                     {athlete_id: 6, total: 8.5, waves: [4.5, 4.0]},
                                     {athlete_id: 5, total: 7.0, waves: [7.0]},
                                     {athlete_id: 4, total: 5.0, waves: [2.0, 3.0]},
                                     {athlete_id: 1, total: 3.0, waves: [1.0, 2.0]}
                                 ])
    end

    it 'ranks same scores by highest wave' do
      heat.scores.create([
        {athlete_id: 1, judge_id: 10, wave: 0, score: 1},
        {athlete_id: 1, judge_id: 10, wave: 1, score: 2},

        {athlete_id: 2, judge_id: 10, wave: 0, score: 3},
        {athlete_id: 2, judge_id: 10, wave: 1, score: 8},

        {athlete_id: 3, judge_id: 10, wave: 0, score: 5},
        {athlete_id: 3, judge_id: 10, wave: 1, score: 7},

        {athlete_id: 4, judge_id: 10, wave: 0, score: 2},
        {athlete_id: 4, judge_id: 10, wave: 1, score: 3},

        {athlete_id: 5, judge_id: 10, wave: 0, score: 3},
        {athlete_id: 5, judge_id: 10, wave: 1, score: 4},

        {athlete_id: 6, judge_id: 10, wave: 0, score: 7},
      ])

      expect(heat.result).to eql([
                                     {athlete_id: 3, total: 12.0, waves: [5.0, 7.0]},
                                     {athlete_id: 2, total: 11.0, waves: [3.0, 8.0]},
                                     {athlete_id: 6, total: 7.0, waves: [7.0]},
                                     {athlete_id: 5, total: 7.0, waves: [3.0, 4.0]},
                                     {athlete_id: 4, total: 5.0, waves: [2.0, 3.0]},
                                     {athlete_id: 1, total: 3.0, waves: [1.0, 2.0]}
                                 ])
    end

    it 'ranks based on two wave totals' do
      [1, 2, 2, 1, 1, 2].each_with_index {|score, index| heat.scores.create({athlete_id: 1, judge_id: 10, wave: index, score: score})}
      [3, 8, 4.5, 5.5].each_with_index {|score, index| heat.scores.create({athlete_id: 2, judge_id: 10, wave: index, score: score})}
      [1, 1, 9, 3, 2].each_with_index {|score, index| heat.scores.create({athlete_id: 3, judge_id: 10, wave: index, score: score})}
      [2, 3, 0.9, 1, 9].each_with_index {|score, index| heat.scores.create({athlete_id: 4, judge_id: 10, wave: index, score: score})}
      [3, 4].each_with_index {|score, index| heat.scores.create({athlete_id: 5, judge_id: 10, wave: index, score: score})}
      [7].each_with_index {|score, index| heat.scores.create({athlete_id: 6, judge_id: 10, wave: index, score: score})}

      expect(heat.result).to eql([
                                     {athlete_id: 2, total: 13.5, waves: [3.0, 8.0, 4.5, 5.5]},
                                     {athlete_id: 3, total: 12.0, waves: [1.0, 1.0, 9.0, 3.0, 2.0]},
                                     {athlete_id: 4, total: 12.0, waves: [2.0, 3.0, 0.9, 1.0, 9.0]},
                                     {athlete_id: 6, total: 7.0, waves: [7.0]},
                                     {athlete_id: 5, total: 7.0, waves: [3.0, 4.0]},
                                     {athlete_id: 1, total: 4.0, waves: [1.0, 2.0, 2.0, 1.0, 1.0, 2.0]}
                                 ])
    end

    it 'should average the scores across all judges' do
      [1, 2, 3.24, 1, 1, 2].each_with_index {|score, index| heat.scores.create({athlete_id: 1, judge_id: 10, wave: index, score: score})}
      [1.5, 1.5, 3.55, 2, 1, 2].each_with_index {|score, index| heat.scores.create({athlete_id: 1, judge_id: 11, wave: index, score: score})}
      [1.5, 1, 4.75, 1, 1.5, 2].each_with_index {|score, index| heat.scores.create({athlete_id: 1, judge_id: 12, wave: index, score: score})}

      [3.55, 8, 4, 5.5].each_with_index {|score, index| heat.scores.create({athlete_id: 2, judge_id: 10, wave: index, score: score})}
      [4.75, 8.5, 3.5, 6.5].each_with_index {|score, index| heat.scores.create({athlete_id: 2, judge_id: 11, wave: index, score: score})}
      [3.25, 9, 3, 6].each_with_index {|score, index| heat.scores.create({athlete_id: 2, judge_id: 12, wave: index, score: score})}

      [1, 1, 9, 3, 2].each_with_index {|score, index| heat.scores.create({athlete_id: 3, judge_id: 10, wave: index, score: score})}
      [1.3, 1.25, 8.9, 3.75, 2.12].each_with_index {|score, index| heat.scores.create({athlete_id: 3, judge_id: 11, wave: index, score: score})}
      [1.25, 1, 9, 3.5, 2.5].each_with_index {|score, index| heat.scores.create({athlete_id: 3, judge_id: 12, wave: index, score: score})}

      expect(heat.result).to eql([
                                     {athlete_id: 2, total: 14.5, waves: [3.85, 8.5, 3.5, 6.0]},
                                     {athlete_id: 3, total: 12.39, waves: [1.18, 1.08, 8.97, 3.42, 2.21]},
                                     {athlete_id: 1, total: 5.85, waves: [1.33, 1.5, 3.85, 1.33, 1.17, 2.0]},
                                     {athlete_id: 4, total: 0.0, waves: []},
                                     {athlete_id: 5, total: 0.0, waves: []},
                                     {athlete_id: 6, total: 0.0, waves: []}
                                 ])
    end

    it 'removes unscored waves from the average wave score' do
      [7.5, 9.5].each_with_index {|score, index| heat.scores.create({athlete_id: 1, judge_id: 10, wave: index, score: score})}
      heat.scores.create({athlete_id: 1, judge_id: 11, wave: 1, score: 8.25})
      heat.scores.create({athlete_id: 1, judge_id: 12, wave: 1, score: 8.25})

      [3, 1.25, 5.5].each_with_index {|score, index| heat.scores.create({athlete_id: 2, judge_id: 10, wave: index, score: score})}
      [3, 1.75].each_with_index {|score, index| heat.scores.create({athlete_id: 2, judge_id: 11, wave: index, score: score})}
      heat.scores.create({athlete_id: 2, judge_id: 12, wave: 0, score: 3})
      heat.scores.create({athlete_id: 2, judge_id: 12, wave: 2, score: 5.5})
      heat.scores.create({athlete_id: 2, judge_id: 12, wave: 3, score: 6})

      expect(heat.result).to eql([
                                     {athlete_id: 1, total: 16.17, waves: [7.5, 8.67]},
                                     {athlete_id: 2, total: 11.5, waves: [3.0, 1.5, 5.5, 6.0]},
                                     {athlete_id: 3, total: 0.0, waves: []},
                                     {athlete_id: 4, total: 0.0, waves: []},
                                     {athlete_id: 5, total: 0.0, waves: []},
                                     {athlete_id: 6, total: 0.0, waves: []}
                                 ])
    end

    it 'handles unscored waves at the end of the wave score row' do
      [1.75, 1, 1.5, 2.5, 3.2, 1, 2].each_with_index {|score, index| heat.scores.create({athlete_id: 5, judge_id: 14, wave: index, score: score})}
      [1.00, 1, 1.0, 3.0, 3.0, 1, 1].each_with_index {|score, index| heat.scores.create({athlete_id: 5, judge_id: 15, wave: index, score: score})}

      [1.5, 2.5, 2.5, 2.5].each_with_index {|score, index| heat.scores.create({athlete_id: 3, judge_id: 14, wave: index, score: score})}
      [1.0, 2.0, 3.0, 2.0].each_with_index {|score, index| heat.scores.create({athlete_id: 3, judge_id: 15, wave: index, score: score})}

      [1, 3, 1, 1].each_with_index {|score, index| heat.scores.create({athlete_id: 4, judge_id: 14, wave: index, score: score})}
      [0.75, 3, 1, 0.5].each_with_index {|score, index| heat.scores.create({athlete_id: 4, judge_id: 15, wave: index, score: score})}

      [2.5].each_with_index {|score, index| heat.scores.create({athlete_id: 2, judge_id: 14, wave: index, score: score})}
      [2].each_with_index {|score, index| heat.scores.create({athlete_id: 2, judge_id: 15, wave: index, score: score})}

      expect(heat.result).to eql([{:athlete_id=>5, :total=>5.85, :waves=>[1.38, 1.0, 1.25, 2.75, 3.1, 1.0, 1.5]},
                                  {:athlete_id=>3,  :total=>5.0,  :waves=>[1.25, 2.25, 2.75, 2.25]},
                                  {:athlete_id=>4,  :total=>4.0,  :waves=>[0.88, 3.0, 1.0, 0.75]},
                                  {:athlete_id=>2,  :total=>2.25, :waves=>[2.25]},
                                  {athlete_id: 1, total: 0.0, waves: []},
                                  {athlete_id: 6, total: 0.0, waves: []}])
    end

    it 'lists the athletes by seed if there is no score' do
      expect(heat.result).to eql([
                                     {athlete_id: 1, total: 0.0, waves: []},
                                     {athlete_id: 2, total: 0.0, waves: []},
                                     {athlete_id: 3, total: 0.0, waves: []},
                                     {athlete_id: 4, total: 0.0, waves: []},
                                     {athlete_id: 5, total: 0.0, waves: []},
                                     {athlete_id: 6, total: 0.0, waves: []}
                                 ])
    end

  end
end
