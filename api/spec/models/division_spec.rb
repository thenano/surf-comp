require 'rails_helper'

RSpec.describe Division, :type => :model do
  describe '#draw' do

    describe 'with 24 athletes' do
      let(:division) { create(:division_with_athletes) }

      it 'adds 6 athletes per heat by seed' do
        athletes = division.users
        division.draw
        expect(division.heats[0].users).to eq(
                                               [
                                                   athletes[0],
                                                   athletes[4],
                                                   athletes[8],
                                                   athletes[12],
                                                   athletes[16],
                                                   athletes[20],
                                               ])

        expect(division.heats[1].users).to eq(
                                               [
                                                   athletes[1],
                                                   athletes[5],
                                                   athletes[9],
                                                   athletes[13],
                                                   athletes[17],
                                                   athletes[21],
                                               ])

        expect(division.heats[2].users).to eq(
                                               [
                                                   athletes[2],
                                                   athletes[6],
                                                   athletes[10],
                                                   athletes[14],
                                                   athletes[18],
                                                   athletes[22],
                                               ])

        expect(division.heats[3].users).to eq(
                                               [
                                                   athletes[3],
                                                   athletes[7],
                                                   athletes[11],
                                                   athletes[15],
                                                   athletes[19],
                                                   athletes[23],
                                               ])
      end
    end

    describe 'with 25' do
      let(:division) { create(:division_with_athletes, athletes_count: 25) }

      it 'adds 5 athletes per heat by seed' do
        athletes = division.users
        division.draw
        expect(division.heats[0].users).to eq(
                                               [
                                                   athletes[0],
                                                   athletes[5],
                                                   athletes[10],
                                                   athletes[15],
                                                   athletes[20]
                                               ])

        expect(division.heats[1].users).to eq(
                                               [
                                                   athletes[1],
                                                   athletes[6],
                                                   athletes[11],
                                                   athletes[16],
                                                   athletes[21]
                                               ])

        expect(division.heats[2].users).to eq(
                                               [
                                                   athletes[2],
                                                   athletes[7],
                                                   athletes[12],
                                                   athletes[17],
                                                   athletes[22]
                                               ])

        expect(division.heats[3].users).to eq(
                                               [
                                                   athletes[3],
                                                   athletes[8],
                                                   athletes[13],
                                                   athletes[18],
                                                   athletes[23]
                                               ])

        expect(division.heats[4].users).to eq(
                                               [
                                                   athletes[4],
                                                   athletes[9],
                                                   athletes[14],
                                                   athletes[19],
                                                   athletes[24]
                                               ])
      end
    end

    describe 'with 26 athletes' do
      let(:division) { create(:division_with_athletes, athletes_count: 26) }

      it 'adds 5 athletes per heat by seed and 6 athletes to the first heat' do
        athletes = division.users
        division.draw
        expect(division.heats[0].users).to eq(
                                               [
                                                   athletes[0],
                                                   athletes[5],
                                                   athletes[10],
                                                   athletes[15],
                                                   athletes[20],
                                                   athletes[25]
                                               ])

        expect(division.heats[1].users).to eq(
                                               [
                                                   athletes[1],
                                                   athletes[6],
                                                   athletes[11],
                                                   athletes[16],
                                                   athletes[21]
                                               ])

        expect(division.heats[2].users).to eq(
                                               [
                                                   athletes[2],
                                                   athletes[7],
                                                   athletes[12],
                                                   athletes[17],
                                                   athletes[22]
                                               ])

        expect(division.heats[3].users).to eq(
                                               [
                                                   athletes[3],
                                                   athletes[8],
                                                   athletes[13],
                                                   athletes[18],
                                                   athletes[23]
                                               ])

        expect(division.heats[4].users).to eq(
                                               [
                                                   athletes[4],
                                                   athletes[9],
                                                   athletes[14],
                                                   athletes[19],
                                                   athletes[24]
                                               ])
      end
    end

    describe 'with 6 athletes' do
      let(:division) { create(:division_with_athletes, athletes_count: 6) }

      it 'creates the final with all athletes on it' do
        athletes = division.users
        division.draw
        expect(division.heats[0].users).to eq(
                                               [
                                                   athletes[0],
                                                   athletes[1],
                                                   athletes[2],
                                                   athletes[3],
                                                   athletes[4],
                                                   athletes[5]
                                               ])
      end

      it 'names the heat "Final"' do
        division.draw
        expect(division.heats.first.name).to eq('Final')
      end
    end

    describe 'with 12 athletes' do
      let(:division) { create(:division_with_athletes, athletes_count: 12) }

      it 'creates an empty final' do
        division.draw
        expect(division.heats.last.name).to eq('Final')
        expect(division.heats.last.users).to be_empty
      end

      it 'creates the first heat as semifinal 1' do
        division.draw
        expect(division.heats.first.name).to eq('Semifinal 1')
      end

      it 'creates the second heat as semifinal 2' do
        division.draw
        expect(division.heats.second.name).to eq('Semifinal 2')
      end
    end
  end
end
