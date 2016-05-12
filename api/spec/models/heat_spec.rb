require 'rails_helper'

RSpec.describe Heat, :type => :model do
  describe '#add_score' do
    let(:heat) { create(:heat_with_athletes) }

    it 'adds the score when there is none' do
      judge_id = 'judge_id'
      athlete_id = 1
      wave = 3
      score = 7.5
      heat.add_score!(judge_id, athlete_id, wave, score)

      expect(heat.scores).to eql({
                                     1 => {judge_id => [nil, nil, nil, 7.5]}
                                 })
    end

    it 'adds another score when there is already one' do
      heat.add_score!('judge_id', 1, 0, 7.5)
      heat.add_score!('judge_id', 1, 3, 9.5)

      expect(heat.scores).to eql({
                                     1 => {'judge_id' => [7.5, nil, nil, 9.5]}
                                 })
    end

    it 'adds another score for another judge' do
      heat.add_score!('judge_id_1', 1, 0, 7.5)
      heat.add_score!('judge_id_1', 1, 3, 9.5)
      heat.add_score!('judge_id_2', 1, 3, 8.25)

      expect(heat.scores).to eql({
                                     1 => { 'judge_id_1' => [7.5, nil, nil, 9.5],
                                            'judge_id_2' => [nil, nil, nil, 8.25]}
                                 })
    end

    it 'adds another score for another athlete' do
      heat.add_score!('judge_id_1', 1, 0, 7.5)
      heat.add_score!('judge_id_1', 1, 3, 9.5)
      heat.add_score!('judge_id_2', 1, 3, 8.25)
      heat.add_score!('judge_id_1', 2, 0, 3)
      heat.add_score!('judge_id_2', 2, 0, 3)
      heat.add_score!('judge_id_1', 2, 1, 1.25)
      heat.add_score!('judge_id_2', 2, 1, 1.75)

      expect(heat.scores).to eql({
                                     1 => { 'judge_id_1' => [7.5, nil, nil, 9.5],
                                            'judge_id_2' => [nil, nil, nil, 8.25]},
                                     2 => { 'judge_id_1' => [3, 1.25],
                                            'judge_id_2' => [3, 1.75]}
                                 })
    end

    it 'raises an exception if athlete is not in the heat' do
      judge_id = 'judge_id'
      athlete_id = 10
      wave = 3
      score = 7.5
      expect{ heat.add_score!(judge_id, athlete_id, wave, score) }.to raise_exception(ActiveRecord::RecordNotFound)
    end
  end

  describe '#result' do
    let(:heat) { create(:heat_with_athletes) }
    it 'ranks the athletes based on highest score' do
      heat.scores = {
          1 => {judge: [1]},
          2 => {judge: [3]},
          3 => {judge: [5]},
          4 => {judge: [2]},
          5 => {judge: [7]},
          6 => {judge: [4]}
      }
      expect(heat.result).to eql([
                                     {athlete_id: 5, total: 7.0, waves: [7]},
                                     {athlete_id: 3, total: 5.0, waves: [5]},
                                     {athlete_id: 6, total: 4.0, waves: [4]},
                                     {athlete_id: 2, total: 3.0, waves: [3]},
                                     {athlete_id: 4, total: 2.0, waves: [2]},
                                     {athlete_id: 1, total: 1.0, waves: [1]},
                                 ])
    end

    it 'ranks the athletes based on the total highest score' do
      heat.scores = {
          1 => {judge: [1, 2]},
          2 => {judge: [3, 8]},
          3 => {judge: [5, 7]},
          4 => {judge: [2, 3]},
          5 => {judge: [7]},
          6 => {judge: [4.5, 4]}
      }
      expect(heat.result).to eql([
                                     {athlete_id: 3, total: 12.0, waves: [5, 7]},
                                     {athlete_id: 2, total: 11.0, waves: [3, 8]},
                                     {athlete_id: 6, total: 8.5, waves: [4.5, 4]},
                                     {athlete_id: 5, total: 7.0, waves: [7]},
                                     {athlete_id: 4, total: 5.0, waves: [2, 3]},
                                     {athlete_id: 1, total: 3.0, waves: [1, 2]}
                                 ])
    end

    it 'ranks same scores by highest wave' do
      heat.scores = {
          1 => {judge: [1, 2]},
          2 => {judge: [3, 8]},
          3 => {judge: [5, 7]},
          4 => {judge: [2, 3]},
          5 => {judge: [3, 4]},
          6 => {judge: [7]}
      }
      expect(heat.result).to eql([
                                     {athlete_id: 3, total: 12.0, waves: [5, 7]},
                                     {athlete_id: 2, total: 11.0, waves: [3, 8]},
                                     {athlete_id: 6, total: 7.0, waves: [7]},
                                     {athlete_id: 5, total: 7.0, waves: [3, 4]},
                                     {athlete_id: 4, total: 5.0, waves: [2, 3]},
                                     {athlete_id: 1, total: 3.0, waves: [1, 2]}
                                 ])
    end

    it 'ranks based on two wave totals' do
      heat.scores = {
          1 => {judge: [1, 2, 2, 1, 1, 2]},
          2 => {judge: [3, 8, 4.5, 5.5]},
          3 => {judge: [1, 1, 9, 3, 2]},
          4 => {judge: [2, 3, 0.9, 1, 9]},
          5 => {judge: [3, 4]},
          6 => {judge: [7]}
      }
      expect(heat.result).to eql([
                                     {athlete_id: 2, total: 13.5, waves: [3, 8, 4.5, 5.5]},
                                     {athlete_id: 3, total: 12.0, waves: [1, 1, 9, 3, 2]},
                                     {athlete_id: 4, total: 12.0, waves: [2, 3, 0.9, 1, 9]},
                                     {athlete_id: 6, total: 7.0, waves: [7]},
                                     {athlete_id: 5, total: 7.0, waves: [3, 4]},
                                     {athlete_id: 1, total: 4.0, waves: [1, 2, 2, 1, 1, 2]}
                                 ])
    end

    it 'should average the scores across all judges' do
      heat.scores = {
          1 => {
              'judge1': [1, 2, 3.24, 1, 1, 2],
              'judge2': [1.5, 1.5, 3.55, 2, 1, 2],
              'judge3': [1.5, 1, 4.75, 1, 1.5, 2],
          },
          8 => {
              'judge1': [3.55, 8, 4, 5.5],
              'judge2': [4.75, 8.5, 3.5, 6.5],
              'judge3': [3.25, 9, 3, 6],
          },
          9 => {
              'judge1': [1, 1, 9, 3, 2],
              'judge2': [1.3, 1.25, 8.9, 3.75, 2.12],
              'judge3': [1.25, 1, 9, 3.5, 2.5]
          }
      }

      expect(heat.result).to eql([
                                     {athlete_id: 2, total: 14.5, waves: [3.85, 8.5, 3.5, 6.0]},
                                     {athlete_id: 3, total: 12.39, waves: [1.18, 1.08, 8.97, 3.42, 2.21]},
                                     {athlete_id: 1, total: 5.85, waves: [1.33, 1.5, 3.85, 1.33, 1.17, 2.0]}
                                 ])
    end

    it 'removes unscored waves from the average wave score' do
      heat.scores = {
          1 => { 'judge_1': [7.5, 9.5],
                 'judge_2': [nil, 8.25],
                 'judge_3': [nil, 8.25]},
          2 => { 'judge_1': [3, 1.25, 5.5],
                 'judge_2': [3, 1.75],
                 'judge_3': [3, nil, 5.5, 6]}
      }

      expect(heat.result).to eql([
                                     {athlete_id: 1, total: 16.17, waves: [7.5, 8.67]},
                                     {athlete_id: 2, total: 11.5, waves: [3.0, 1.5, 5.5, 6.0]},
                                 ])
    end

  end
end
