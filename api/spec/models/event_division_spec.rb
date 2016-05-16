require 'rails_helper'

RSpec.describe EventDivision, :type => :model do
  describe '#draw' do

    describe 'with 24 athletes' do
      let(:division) { create(:division_with_athletes) }

      it 'creates 7 heats' do
        division.draw
        expect(division.heats.size).to eq(7)
      end

      it 'creates an empty final' do
        division.draw

        expect(division.heats.last.round).to eq('Final')
        expect(division.heats.last.round_position).to eq(2)
        expect(division.heats.last.athletes).to be_empty
        expect(division.heats.last.position).to eq(0)
      end

      it 'creates two empty semifinals' do
        division.draw
        expect(division.heats[5].round).to eq('Semifinal')
        expect(division.heats[5].athletes).to be_empty
        expect(division.heats[5].round_position).to eq(1)
        expect(division.heats[5].position).to eq(1)

        expect(division.heats[4].round).to eq('Semifinal')
        expect(division.heats[4].athletes).to be_empty
        expect(division.heats[4].round_position).to eq(1)
        expect(division.heats[4].position).to eq(0)
      end

      it 'adds 6 athletes per heat by seed and gives the quarterfinal heat name' do
        division.draw

        expect(division.heats[0].round).to eq('Quarterfinal')
        expect(division.heats[0].round_position).to eq(0)
        expect(division.heats[0].position).to eq(0)

        expect(division.heats[1].round).to eq('Quarterfinal')
        expect(division.heats[1].round_position).to eq(0)
        expect(division.heats[1].position).to eq(1)

        expect(division.heats[2].round).to eq('Quarterfinal')
        expect(division.heats[2].round_position).to eq(0)
        expect(division.heats[2].position).to eq(2)

        expect(division.heats[3].round).to eq('Quarterfinal')
        expect(division.heats[3].round_position).to eq(0)
        expect(division.heats[3].position).to eq(3)

        expect(division.heats[0].athletes.map(&:id)).to eq([1, 8,  9, 16, 17, 24])
        expect(division.heats[1].athletes.map(&:id)).to eq([4, 5, 12, 13, 20, 21])
        expect(division.heats[2].athletes.map(&:id)).to eq([3, 6, 11, 14, 19, 22])
        expect(division.heats[3].athletes.map(&:id)).to eq([2, 7, 10, 15, 18, 23])
      end
    end

    describe 'with 25' do
      let(:division) { create(:division_with_athletes, athletes_count: 25) }

      it 'creates 11 heats' do
        division.draw
        expect(division.heats.size).to eq(11)
      end

      it 'creates an empty final' do
        division.draw

        expect(division.heats.last.round).to eq('Final')
        expect(division.heats.last.athletes).to be_empty
        expect(division.heats.last.round_position).to eq(3)
        expect(division.heats.last.position).to eq(0)
      end

      it 'creates two empty semifinals' do
        division.draw

        expect(division.heats[9].round).to eq('Semifinal')
        expect(division.heats[9].athletes).to be_empty
        expect(division.heats[9].round_position).to eq(2)
        expect(division.heats[9].position).to eq(1)

        expect(division.heats[8].round).to eq('Semifinal')
        expect(division.heats[8].athletes).to be_empty
        expect(division.heats[8].round_position).to eq(2)
        expect(division.heats[8].position).to eq(0)
      end

      it 'creates three empty quarterfinals' do
        division.draw

        expect(division.heats[7].round).to eq('Quarterfinal')
        expect(division.heats[7].athletes).to be_empty
        expect(division.heats[7].round_position).to eq(1)
        expect(division.heats[7].position).to eq(2)

        expect(division.heats[6].round).to eq('Quarterfinal')
        expect(division.heats[6].athletes).to be_empty
        expect(division.heats[6].round_position).to eq(1)
        expect(division.heats[6].position).to eq(1)

        expect(division.heats[5].round).to eq('Quarterfinal')
        expect(division.heats[5].athletes).to be_empty
        expect(division.heats[5].round_position).to eq(1)
        expect(division.heats[5].position).to eq(0)
      end

      it 'adds 5 athletes per heat by seed and gives the round 1 heat name' do
        division.draw

        expect(division.heats[0].round).to eq('Round 1')
        expect(division.heats[0].round_position).to eq(0)
        expect(division.heats[0].position).to eq(0)

        expect(division.heats[1].round).to eq('Round 1')
        expect(division.heats[1].round_position).to eq(0)
        expect(division.heats[1].position).to eq(1)

        expect(division.heats[2].round).to eq('Round 1')
        expect(division.heats[2].round_position).to eq(0)
        expect(division.heats[2].position).to eq(2)

        expect(division.heats[3].round).to eq('Round 1')
        expect(division.heats[3].round_position).to eq(0)
        expect(division.heats[3].position).to eq(3)

        expect(division.heats[4].round).to eq('Round 1')
        expect(division.heats[4].round_position).to eq(0)
        expect(division.heats[4].position).to eq(4)

        expect(division.heats[0].athletes.map(&:id)).to eq([1, 10, 11, 20, 21])
        expect(division.heats[1].athletes.map(&:id)).to eq([5,  6, 15, 16, 25])
        expect(division.heats[2].athletes.map(&:id)).to eq([3,  8, 13, 18, 23])
        expect(division.heats[3].athletes.map(&:id)).to eq([4,  7, 14, 17, 24])
        expect(division.heats[4].athletes.map(&:id)).to eq([2,  9, 12, 19, 22])
      end
    end

    describe 'with 26 athletes' do
      let(:division) { create(:division_with_athletes, athletes_count: 26) }

      it 'adds 5 athletes per heat by seed and 6 athletes to the second heat' do
        division.draw

        expect(division.heats[0].athletes.map(&:id)).to eq([1, 10, 11, 20, 21])
        expect(division.heats[1].athletes.map(&:id)).to eq([5,  6, 15, 16, 25, 26])
        expect(division.heats[2].athletes.map(&:id)).to eq([3,  8, 13, 18, 23])
        expect(division.heats[3].athletes.map(&:id)).to eq([4,  7, 14, 17, 24])
        expect(division.heats[4].athletes.map(&:id)).to eq([2,  9, 12, 19, 22])
      end
    end

    describe 'with 6 athletes' do
      let(:division) { create(:division_with_athletes, athletes_count: 6) }

      it 'creates the final with all athletes on it' do
        division.draw

        expect(division.heats[0].athletes.map(&:id)).to eq([1, 2, 3, 4, 5, 6])
        expect(division.heats[0].position).to eq(0)
      end

      it 'names the heat "Final"' do
        division.draw
        expect(division.heats.first.round).to eq('Final')
      end
    end

    describe 'with 12 athletes' do
      let(:division) { create(:division_with_athletes, athletes_count: 12) }

      it 'creates 3 heats' do
        division.draw

        expect(division.heats.size).to eq(3)
      end

      it 'creates an empty final' do
        division.draw

        expect(division.heats.last.round).to eq('Final')
        expect(division.heats.last.athletes).to be_empty
        expect(division.heats.last.round_position).to eq(1)
        expect(division.heats.last.position).to eq(0)
      end

      it 'creates the first heat as a semifinal' do
        division.draw

        expect(division.heats.first.round).to eq('Semifinal')
        expect(division.heats.first.round_position).to eq(0)
        expect(division.heats.first.position).to eq(0)
      end

      it 'creates the second heat as a semifinal' do
        division.draw

        expect(division.heats.second.round).to eq('Semifinal')
        expect(division.heats.second.round_position).to eq(0)
        expect(division.heats.second.position).to eq(1)
      end

      it 'seeds correctly' do
        division.draw

        expect(division.heats[0].athletes.map(&:id)).to eq([1, 4, 5, 8,  9, 12])
        expect(division.heats[1].athletes.map(&:id)).to eq([2, 3, 6, 7, 10, 11])
      end
    end

    describe 'with 36 athletes' do
      let(:division) { create(:division_with_athletes, athletes_count: 36) }

      it 'seeds correctly' do
        division.draw

        expect(division.heats[0].athletes.map(&:id)).to eq([1, 12, 13, 24, 25, 36])
        expect(division.heats[1].athletes.map(&:id)).to eq([6,  7, 18, 19, 30, 31])
        expect(division.heats[2].athletes.map(&:id)).to eq([4,  9, 16, 21, 28, 33])
        expect(division.heats[3].athletes.map(&:id)).to eq([3, 10, 15, 22, 27, 34])
        expect(division.heats[4].athletes.map(&:id)).to eq([5,  8, 17, 20, 29, 32])
        expect(division.heats[5].athletes.map(&:id)).to eq([2, 11, 14, 23, 26, 35])
      end
    end

    describe 'with 48 athletes' do
      let(:division) { create(:division_with_athletes, athletes_count: 48) }

      it 'seeds correctly' do
        division.draw

        expect(division.heats[0].athletes.map(&:id)).to eq([1, 16, 17, 32, 33, 48])
        expect(division.heats[1].athletes.map(&:id)).to eq([8,  9, 24, 25, 40, 41])
        expect(division.heats[2].athletes.map(&:id)).to eq([5, 12, 21, 28, 37, 44])
        expect(division.heats[3].athletes.map(&:id)).to eq([4, 13, 20, 29, 36, 45])
        expect(division.heats[4].athletes.map(&:id)).to eq([3, 14, 19, 30, 35, 46])
        expect(division.heats[5].athletes.map(&:id)).to eq([6, 11, 22, 27, 38, 43])
        expect(division.heats[6].athletes.map(&:id)).to eq([7, 10, 23, 26, 39, 42])
        expect(division.heats[7].athletes.map(&:id)).to eq([2, 15, 18, 31, 34, 47])
      end
    end
  end

  describe '#add_athlete' do
    describe 'with 23 athletes' do
      let(:division) { create(:division_with_athletes, athletes_count: 23) }

      it 'adds the athlete to the division' do
        division.draw

        new_athlete = create(:user)
        division.add_athlete(new_athlete)

        expect(division.users.find(new_athlete.id)).to eq(new_athlete)
      end

      it 'should add the athlete to the first available heat' do
        division.draw

        expect(division.heats.first.athletes.size).to eq(5)
        new_athlete = create(:user)

        division.add_athlete(new_athlete)

        expect(division.heats.first.athletes.size).to eq(6)
        expect(division.heats.first.athletes.last).to eq(new_athlete)
      end

      it 'does not add more heats' do
        division.draw

        draw_size = division.heats.size
        new_athlete = create(:user)

        removed_heats, added_heats = division.add_athlete(new_athlete)

        expect(division.heats(true).size).to eq(draw_size)
        expect(added_heats).to be_empty
        expect(removed_heats).to be_empty
      end
    end

    describe 'with 22 athletes' do
      let(:division) { create(:division_with_athletes, athletes_count: 22) }

      it 'should add the athlete to the first to last heat' do
        division.draw

        expect(division.heats.first.athletes.size).to eq(5)
        expect(division.heats[3].athletes.size).to eq(5)
        new_athlete = create(:user)

        division.add_athlete(new_athlete)

        expect(division.heats.first.athletes.size).to eq(6)
        expect(division.heats.first.athletes.last).to eq(new_athlete)
      end

      it 'does not add more heats' do
        division.draw

        draw_size = division.heats.size
        new_athlete = create(:user)

        removed_heats, added_heats = division.add_athlete(new_athlete)

        expect(division.heats.size).to eq(draw_size)
        expect(added_heats).to be_empty
        expect(removed_heats).to be_empty
      end
    end

    describe 'with 25 athletes' do
      let(:division) { create(:division_with_athletes, athletes_count: 25) }

      it 'should add the athlete to the first heat' do
        division.draw

        expect(division.heats.first.athletes.size).to eq(5)
        new_athlete = create(:user)

        division.add_athlete(new_athlete)

        expect(division.heats.first.athletes.size).to eq(6)
        expect(division.heats.first.athletes.last).to eq(new_athlete)
      end

      it 'should add the athlete to the first heat in the first available spot' do
        division.draw

        expect(division.heats.first.athletes.size).to eq(5)
        division.heats.first.athlete_heats.last.update_attribute(:position, 5)
        new_athlete = create(:user)

        division.add_athlete(new_athlete)

        expect(division.heats.first.athletes.size).to eq(6)
        expect(division.heats.first.athlete_heats.find_by_position(4).athlete).to eq(new_athlete)
      end

      it 'does not add more heats' do
        division.draw

        draw_size = division.heats.size
        new_athlete = create(:user)

        removed_heats, added_heats = division.add_athlete(new_athlete)

        expect(division.heats.size).to eq(draw_size)
        expect(added_heats).to be_empty
        expect(removed_heats).to be_empty
      end
    end

    describe 'with 24 athletes' do

      let(:division) { create(:division_with_athletes, athletes_count: 24) }

      before(:each) do
        division.draw
        @new_athlete = create(:user)
        @removed_heats, @added_heats = division.add_athlete(@new_athlete)
      end

      it 'creates a new round 1 heat with the athlete' do
        first_round = division.heats(true).where(round_position: 0)

        expect(first_round.size).to eq(5)
        expect(first_round.last.athletes.size).to eq(1)
        expect(first_round.last.round).to eq('Round 1')
        expect(first_round.last.round_position).to eq(0)
        expect(first_round.last.position).to eq(4)
        expect(first_round.last.athletes.first).to eq(@new_athlete)
      end

      it 'renames the round of the first round heats' do
        division.heats.where(round_position: 0).each do |heat|
          expect(heat.round).to eq('Round 1')
        end
      end

      it 'renames the round of the first round heats' do
        division.heats.where(round_position: 0).each do |heat|
          expect(heat.round).to eq('Round 1')
        end
      end

      it 'creates a new round of quarterfinals' do
        quarters = division.heats.where(round: 'Quarterfinal')
        expect(quarters.size).to eq(3)

        expect(quarters.first.position).to eq(0)
        expect(quarters.first.round_position).to eq(1)
        expect(quarters.second.position).to eq(1)
        expect(quarters.second.round_position).to eq(1)
        expect(quarters.last.position).to eq(2)
        expect(quarters.last.round_position).to eq(1)
      end

      it 'updates the position of the semis' do
        semis = division.heats.where(round: 'Semifinal')
        expect(semis.size).to eq(2)

        expect(semis.first.position).to eq(0)
        expect(semis.first.round_position).to eq(2)
        expect(semis.second.position).to eq(1)
        expect(semis.second.round_position).to eq(2)
      end

      it 'updates the position of the final' do
        final = division.heats.where(round: 'Final')
        expect(final.size).to eq(1)

        expect(final.first.position).to eq(0)
        expect(final.first.round_position).to eq(3)
      end

      it 'returns all new added heats and all removed heats' do
        expect(@added_heats.map(&:id)).to eq([8, 9, 10, 11, 12, 13, 14])
        expect(@removed_heats.map(&:id)).to eq([5, 6, 7])
      end
    end

    describe 'with 12 athletes' do
      before(:each) do
        division.draw

        @new_athlete = create(:user)
        @removed_heats, @added_heats = division.add_athlete(@new_athlete)
      end

      let(:division) { create(:division_with_athletes, athletes_count: 12) }

      it 'create a new quarterfinal heat with the athlete' do
        first_round = division.heats.where(round_position: 0)

        expect(first_round.size).to eq(3)
        expect(first_round.last.athletes.size).to eq(1)
        expect(first_round.last.round).to eq('Quarterfinal')
        expect(first_round.last.position).to eq(2)
        expect(first_round.last.round_position).to eq(0)
        expect(first_round.last.athletes.first).to eq(@new_athlete)
      end

      it 'renames the round of the first round heats' do
        division.heats.where(round_position: 0).each do |heat|
          expect(heat.round).to eq('Quarterfinal')
        end
      end

      it 'creates a new round of semifinals' do
        semis = division.heats.where(round: 'Semifinal')
        expect(semis.size).to eq(2)

        expect(semis.first.position).to eq(0)
        expect(semis.first.round_position).to eq(1)
        expect(semis.last.position).to eq(1)
        expect(semis.last.round_position).to eq(1)
      end

      it 'updates the position of the final' do
        final = division.heats.where(round: 'Final')
        expect(final.size).to eq(1)

        expect(final.first.position).to eq(0)
        expect(final.first.round_position).to eq(2)
      end

      it 'returns all new added heats and all removed heats' do
        expect(@added_heats.map(&:id)).to eq([4, 5, 6, 7])
        expect(@removed_heats.map(&:id)).to eq([3])
      end
    end

    describe 'with 36 athletes' do
      let(:division) { create(:division_with_athletes, athletes_count: 36) }

      before(:each) do
        division.draw

        @new_athlete = create(:user)
        @removed_heats, @added_heats = division.add_athlete(@new_athlete)
      end

      it 'creates a new round 1 heat with the athlete' do
        first_round = division.heats.where(round_position: 0)

        expect(first_round.size).to eq(7)
        expect(first_round.last.athletes.size).to eq(1)
        expect(first_round.last.round).to eq('Round 1')
        expect(first_round.last.position).to eq(6)
        expect(first_round.last.round_position).to eq(0)
        expect(first_round.last.athletes.first).to eq(@new_athlete)
      end

      it 'create a new quarterfinal' do
        quarters = division.heats.where(round: 'Quarterfinal')

        expect(quarters.size).to eq(4)
        expect(quarters.last.position).to eq(3)
        expect(quarters.last.round_position).to eq(1)
      end

      it 'returns all new added heats and all removed heats' do
        expect(@added_heats.map(&:id)).to eq([13, 14, 15, 16, 17, 18, 19, 20])
        expect(@removed_heats.map(&:id)).to eq([7, 8, 9, 10, 11, 12])
      end
    end
  end

  describe '#remove_athlete' do

    describe 'with 24 athletes' do
      let(:division) { create(:division_with_athletes) }

      it 'removes the athlete from the heat' do
        division.draw

        quarters = division.heats.where(round: 'Quarterfinal')
        removed_athlete = quarters.last.athletes.last
        division.remove_athlete(quarters.last.id, removed_athlete.id)

        expect(quarters.last.athletes.size).to eq(5)
        expect { quarters.last.athletes.find(removed_athlete.id) }.to raise_error(ActiveRecord::RecordNotFound)
      end

      it 'removes the athlete from the division' do
        division.draw

        quarters = division.heats.where(round: 'Quarterfinal')
        removed_athlete = quarters.last.athletes.last
        division.remove_athlete(quarters.last.id, removed_athlete.id)

        expect { division.users.find(removed_athlete.id) }.to raise_error(ActiveRecord::RecordNotFound)
      end

      it 'does not add or remove heats' do
        division.draw

        quarters = division.heats.where(round: 'Quarterfinal')
        removed_athlete = quarters.last.athletes.last
        removed_heats, added_heats = division.remove_athlete(quarters.last.id, removed_athlete.id)

        expect(added_heats).to be_empty
        expect(removed_heats).to be_empty
      end

      describe 'when removing the last athlete from a heat' do
        before(:each) do
          division.draw
          @new_athlete = create(:user)
          division.add_athlete(@new_athlete)

          @first_round = division.heats.where(round_position: 0)
        end

        it 'removes the empty heat' do
          division.remove_athlete(@first_round.last.id, @new_athlete.id)
          expect(division.heats.where(round_position: 0).size).to eq(4)
        end

        it 'renames the round 1 heats to quarters' do
          division.remove_athlete(@first_round.last.id, @new_athlete.id)
          division.heats.where(round_position: 0).each { |heat| expect(heat.round).to eq('Quarterfinal') }
        end

        it 'removes the extra heats' do
          division.remove_athlete(@first_round.last.id, @new_athlete.id)

          expect(division.heats.where(round: 'Round 1')).to be_empty

          quarters = division.heats.where(round: 'Quarterfinal')
          expect(quarters.size).to be(4)
          expect(quarters.first.position).to be(0)
          expect(quarters.first.round_position).to be(0)
          expect(quarters.second.position).to be(1)
          expect(quarters.second.round_position).to be(0)
          expect(quarters[2].position).to be(2)
          expect(quarters[2].round_position).to be(0)
          expect(quarters.last.position).to be(3)
          expect(quarters.last.round_position).to be(0)

          semis = division.heats.where(round: 'Semifinal')
          expect(semis.size).to be(2)
          expect(semis.first.position).to be(0)
          expect(semis.first.round_position).to be(1)
          expect(semis.second.position).to be(1)
          expect(semis.second.round_position).to be(1)

          expect(division.heats.where(round: 'Final').size).to be(1)
          expect(division.heats.where(round: 'Final').first.position).to be(0)
          expect(division.heats.where(round: 'Final').first.round_position).to be(2)
        end

        it 'returns all new added heats and all removed heats' do
          removed_heats, added_heats = division.remove_athlete(@first_round.last.id, @new_athlete.id)
          expect(removed_heats.map(&:id)).to eq([8, 9, 10, 11, 12, 13, 14])
          expect(added_heats.map(&:id)).to eq([15, 16, 17])
        end
      end
    end
  end

  describe '#end_heat' do
    def score_and_end_heat(heat)
      heat.scores = {
          1 => {'judge': [1, 2]},
          2 => {'judge': [4, 4]},
          3 => {'judge': [4, 3]},
          4 => {'judge': [10, 10]},
          5 => {'judge': [7, 7]},
          6 => {'judge': [6, 5]}
      }

      division.end_heat!(heat)
    end

    describe 'with 24 athletes' do
      let(:division) { create(:division_with_athletes) }

      before :each do
        division.draw
      end

      it 'progresses the first 3 of the first heat into the respective semifinal heats' do
        score_and_end_heat(division.heats.first)
        semis = division.heats.where(round: 'Semifinal')

        expect(semis.first.athlete_heats.first.athlete_id).to eq(4)
        expect(semis.first.athlete_heats.first.position).to eq(0)

        expect(semis.last.athlete_heats.first.athlete_id).to eq(5)
        expect(semis.last.athlete_heats.first.position).to eq(2)

        expect(semis.first.athlete_heats.second.athlete_id).to eq(6)
        expect(semis.first.athlete_heats.second.position).to eq(4)
      end

      it 'progresses the first 3 of the second heat into the respective semifinal heats' do
        score_and_end_heat(division.heats.second)
        semis = division.heats.where(round: 'Semifinal')

        expect(semis.first.athlete_heats.first.athlete_id).to eq(4)
        expect(semis.first.athlete_heats.first.position).to eq(1)

        expect(semis.last.athlete_heats.first.athlete_id).to eq(5)
        expect(semis.last.athlete_heats.first.position).to eq(3)

        expect(semis.first.athlete_heats.last.athlete_id).to eq(6)
        expect(semis.first.athlete_heats.last.position).to eq(5)
      end

      it 'progresses the first 3 of the third heat into the respective semifinal heats' do
        score_and_end_heat(division.heats[2])
        semis = division.heats.where(round: 'Semifinal')

        expect(semis.last.athlete_heats.first.athlete_id).to eq(4)
        expect(semis.last.athlete_heats.first.position).to eq(1)

        expect(semis.first.athlete_heats.first.athlete_id).to eq(5)
        expect(semis.first.athlete_heats.first.position).to eq(3)

        expect(semis.last.athlete_heats.last.athlete_id).to eq(6)
        expect(semis.last.athlete_heats.last.position).to eq(5)
      end

      it 'progresses the first 3 of the last heat into the respective semifinal heats' do
        score_and_end_heat(division.heats[3])
        semis = division.heats.where(round: 'Semifinal')

        expect(semis.last.athlete_heats.first.athlete_id).to eq(4)
        expect(semis.last.athlete_heats.first.position).to eq(0)

        expect(semis.first.athlete_heats.first.athlete_id).to eq(5)
        expect(semis.first.athlete_heats.first.position).to eq(2)

        expect(semis.last.athlete_heats.last.athlete_id).to eq(6)
        expect(semis.last.athlete_heats.last.position).to eq(4)
      end
    end

    describe 'with 12 athletes' do
      let(:division) { create(:division_with_athletes, athletes_count: 12) }

      before :each do
        division.draw
      end

      it 'progresses the first 3 of the first heat into the final' do
        score_and_end_heat(division.heats.first)
        final = division.heats.where(round: 'Final').first

        expect(final.athlete_heats.first.athlete_id).to eq(4)
        expect(final.athlete_heats.first.position).to eq(0)

        expect(final.athlete_heats.second.athlete_id).to eq(5)
        expect(final.athlete_heats.second.position).to eq(2)

        expect(final.athlete_heats.last.athlete_id).to eq(6)
        expect(final.athlete_heats.last.position).to eq(4)
      end

      it 'progresses the first 3 of the last heat into the final' do
        score_and_end_heat(division.heats.second)
        final = division.heats.where(round: 'Final').first

        expect(final.athlete_heats.first.athlete_id).to eq(4)
        expect(final.athlete_heats.first.position).to eq(1)

        expect(final.athlete_heats.second.athlete_id).to eq(5)
        expect(final.athlete_heats.second.position).to eq(3)

        expect(final.athlete_heats.last.athlete_id).to eq(6)
        expect(final.athlete_heats.last.position).to eq(5)
      end

      it 'ends the final with the time' do
        now = Time.now
        allow(Time).to receive(:now).and_return(now)
        score_and_end_heat(division.heats.last)
        expect(division.heats.last.time).to eq(now.utc)
      end
    end

    describe 'with 18 athletes' do
      let(:division) { create(:division_with_athletes, athletes_count: 18) }

      before :each do
        division.draw
      end

      it 'progresses the first 3 of the first heat into the semifinals' do
        score_and_end_heat(division.heats.first)
        semis = division.heats.where(round: 'Semifinal')

        expect(semis.first.athlete_heats.first.athlete_id).to eq(4)
        expect(semis.first.athlete_heats.first.position).to eq(0)

        expect(semis.first.athlete_heats.second.athlete_id).to eq(5)
        expect(semis.first.athlete_heats.second.position).to eq(1)

        expect(semis.second.athlete_heats.first.athlete_id).to eq(6)
        expect(semis.second.athlete_heats.first.position).to eq(3)
      end

      it 'progresses the first 3 of the second heat into the semifinals' do
        score_and_end_heat(division.heats.second)
        semis = division.heats.where(round: 'Semifinal')

        expect(semis.second.athlete_heats.first.athlete_id).to eq(4)
        expect(semis.second.athlete_heats.first.position).to eq(1)

        expect(semis.second.athlete_heats.last.athlete_id).to eq(5)
        expect(semis.second.athlete_heats.last.position).to eq(2)

        expect(semis.first.athlete_heats.first.athlete_id).to eq(6)
        expect(semis.first.athlete_heats.first.position).to eq(4)
      end

      it 'progresses the first 3 of the third heat into the semifinals' do
        score_and_end_heat(division.heats[2])
        semis = division.heats.where(round: 'Semifinal')

        expect(semis.last.athlete_heats.first.athlete_id).to eq(4)
        expect(semis.last.athlete_heats.first.position).to eq(0)

        expect(semis.first.athlete_heats.first.athlete_id).to eq(5)
        expect(semis.first.athlete_heats.first.position).to eq(2)

        expect(semis.first.athlete_heats.last.athlete_id).to eq(6)
        expect(semis.first.athlete_heats.last.position).to eq(3)
      end
    end

    describe 'with 26 athletes' do
      let(:division) { create(:division_with_athletes, athletes_count: 9) }

      before :each do
        division.draw
      end

      it 'progresses the first 3 of the first heat into the final' do
        heat = division.heats.first
        heat.scores = {
            1 => {'judge': [1, 2]},
            2 => {'judge': [4, 4]},
            3 => {'judge': [4, 3]},
            4 => {'judge': [10, 10]},
            5 => {'judge': [7, 7]},
        }
        division.end_heat!(heat)

        final = division.heats.where(round: 'Final').first

        expect(final.athlete_heats.first.athlete_id).to eq(4)
        expect(final.athlete_heats.first.position).to eq(0)

        expect(final.athlete_heats.second.athlete_id).to eq(5)
        expect(final.athlete_heats.second.position).to eq(2)

        expect(final.athlete_heats.last.athlete_id).to eq(2)
        expect(final.athlete_heats.last.position).to eq(4)
      end

      it 'progresses the first and only 2 of the last heat into the final' do
        heat = division.heats.second
        heat.scores = {
            1 => {'judge': [1, 2]},
            3 => {'judge': [4, 3]},
            4 => {'judge': [10, 10]},
            5 => {'judge': [7, 7]},
        }
        division.end_heat!(heat)

        final = division.heats.where(round: 'Final').first

        expect(final.athlete_heats.size).to eq(2)
        expect(final.athlete_heats.first.athlete_id).to eq(4)
        expect(final.athlete_heats.first.position).to eq(1)

        expect(final.athlete_heats.second.athlete_id).to eq(5)
        expect(final.athlete_heats.second.position).to eq(3)
      end
    end

    describe 'with 36 athletes' do

      let(:division) { create(:division_with_athletes, athletes_count: 36) }

      before :each do
        division.draw
      end

      it 'progresses the first 3 of the first heat into the quarters' do
        score_and_end_heat(division.heats.first)

        quarters = division.heats.where(round: 'Quarterfinal')

        expect(quarters.first.athlete_heats.first.athlete_id).to eq(4)
        expect(quarters.first.athlete_heats.first.position).to eq(0)

        expect(quarters.second.athlete_heats.first.athlete_id).to eq(5)
        expect(quarters.second.athlete_heats.first.position).to eq(2)

        expect(quarters.first.athlete_heats.last.athlete_id).to eq(6)
        expect(quarters.first.athlete_heats.last.position).to eq(4)
      end

      it 'progresses the first 3 of the last heat into the quarters' do
        score_and_end_heat(division.heats[5])

        quarters = division.heats.where(round: 'Quarterfinal')

        expect(quarters[2].athlete_heats.first.athlete_id).to eq(4)
        expect(quarters[2].athlete_heats.first.position).to eq(0)

        expect(quarters[2].athlete_heats.second.athlete_id).to eq(5)
        expect(quarters[2].athlete_heats.second.position).to eq(2)

        expect(quarters[2].athlete_heats.last.athlete_id).to eq(6)
        expect(quarters[2].athlete_heats.last.position).to eq(4)
      end
    end

    describe 'with 48 athletes' do

      let(:division) { create(:division_with_athletes, athletes_count: 48) }

      before :each do
        division.draw
      end

      it 'progresses the first 3 of the third heat into the quarters' do
        score_and_end_heat(division.heats[2])

        quarters = division.heats.where(round: 'Quarterfinal')

        expect(quarters.second.athlete_heats.first.athlete_id).to eq(4)
        expect(quarters.second.athlete_heats.first.position).to eq(1)

        expect(quarters.first.athlete_heats.first.athlete_id).to eq(5)
        expect(quarters.first.athlete_heats.first.position).to eq(3)

        expect(quarters.second.athlete_heats.last.athlete_id).to eq(6)
        expect(quarters.second.athlete_heats.last.position).to eq(5)
      end

      it 'progresses the first 3 of the fifth heat into the quarters' do
        score_and_end_heat(division.heats[4])

        quarters = division.heats.where(round: 'Quarterfinal')

        expect(quarters[2].athlete_heats.first.athlete_id).to eq(4)
        expect(quarters[2].athlete_heats.first.position).to eq(0)

        expect(quarters[3].athlete_heats.first.athlete_id).to eq(5)
        expect(quarters[3].athlete_heats.first.position).to eq(2)

        expect(quarters[2].athlete_heats.last.athlete_id).to eq(6)
        expect(quarters[2].athlete_heats.last.position).to eq(4)
      end
    end
  end
end
