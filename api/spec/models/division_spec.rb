require 'rails_helper'

RSpec.describe Division, :type => :model do
  describe '#draw' do

    describe 'with 24 athletes' do
      let(:division) { create(:division_with_athletes) }

      it 'creates 7 heats' do
        division.draw
        expect(division.heats.size).to eq(7)
      end

      it 'creates an empty final' do
        division.draw
        p division.heats
        expect(division.heats.last.round).to eq('Final')
        expect(division.heats.last.users).to be_empty
        expect(division.heats.last.position).to eq(20)
      end

      it 'creates two empty semifinals' do
        division.draw
        expect(division.heats[5].round).to eq('Semifinal')
        expect(division.heats[5].users).to be_empty
        expect(division.heats[5].position).to eq(11)

        expect(division.heats[4].round).to eq('Semifinal')
        expect(division.heats[4].users).to be_empty
        expect(division.heats[4].position).to eq(10)
      end

      it 'adds 6 athletes per heat by seed and gives the quarterfinal heat name' do
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
        expect(division.heats[0].round).to eq('Quarterfinal')
        expect(division.heats[0].position).to eq(0)

        expect(division.heats[1].users).to eq(
                                               [
                                                   athletes[1],
                                                   athletes[5],
                                                   athletes[9],
                                                   athletes[13],
                                                   athletes[17],
                                                   athletes[21],
                                               ])
        expect(division.heats[1].round).to eq('Quarterfinal')
        expect(division.heats[1].position).to eq(1)

        expect(division.heats[2].users).to eq(
                                               [
                                                   athletes[2],
                                                   athletes[6],
                                                   athletes[10],
                                                   athletes[14],
                                                   athletes[18],
                                                   athletes[22],
                                               ])
        expect(division.heats[2].round).to eq('Quarterfinal')
        expect(division.heats[2].position).to eq(2)

        expect(division.heats[3].users).to eq(
                                               [
                                                   athletes[3],
                                                   athletes[7],
                                                   athletes[11],
                                                   athletes[15],
                                                   athletes[19],
                                                   athletes[23],
                                               ])
        expect(division.heats[3].round).to eq('Quarterfinal')
        expect(division.heats[3].position).to eq(3)
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
        expect(division.heats.last.users).to be_empty
        expect(division.heats.last.position).to eq(30)
      end

      it 'creates two empty semifinals' do
        division.draw
        expect(division.heats[9].round).to eq('Semifinal')
        expect(division.heats[9].users).to be_empty
        expect(division.heats[9].position).to eq(21)

        expect(division.heats[8].round).to eq('Semifinal')
        expect(division.heats[8].users).to be_empty
        expect(division.heats[8].position).to eq(20)
      end

      it 'creates three empty quarterfinals' do
        division.draw
        expect(division.heats[7].round).to eq('Quarterfinal')
        expect(division.heats[7].users).to be_empty
        expect(division.heats[7].position).to eq(12)

        expect(division.heats[6].round).to eq('Quarterfinal')
        expect(division.heats[6].users).to be_empty
        expect(division.heats[6].position).to eq(11)

        expect(division.heats[5].round).to eq('Quarterfinal')
        expect(division.heats[5].users).to be_empty
        expect(division.heats[5].position).to eq(10)
      end

      it 'adds 5 athletes per heat by seed and gives the round 1 heat name' do
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
        expect(division.heats[0].round).to eq('Round 1')
        expect(division.heats[0].position).to eq(0)

        expect(division.heats[1].users).to eq(
                                               [
                                                   athletes[1],
                                                   athletes[6],
                                                   athletes[11],
                                                   athletes[16],
                                                   athletes[21]
                                               ])
        expect(division.heats[1].round).to eq('Round 1')
        expect(division.heats[1].position).to eq(1)

        expect(division.heats[2].users).to eq(
                                               [
                                                   athletes[2],
                                                   athletes[7],
                                                   athletes[12],
                                                   athletes[17],
                                                   athletes[22]
                                               ])
        expect(division.heats[2].round).to eq('Round 1')
        expect(division.heats[2].position).to eq(2)

        expect(division.heats[3].users).to eq(
                                               [
                                                   athletes[3],
                                                   athletes[8],
                                                   athletes[13],
                                                   athletes[18],
                                                   athletes[23]
                                               ])
        expect(division.heats[3].round).to eq('Round 1')
        expect(division.heats[3].position).to eq(3)

        expect(division.heats[4].users).to eq(
                                               [
                                                   athletes[4],
                                                   athletes[9],
                                                   athletes[14],
                                                   athletes[19],
                                                   athletes[24]
                                               ])
        expect(division.heats[4].round).to eq('Round 1')
        expect(division.heats[4].position).to eq(4)
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
        expect(division.heats.last.users).to be_empty
        expect(division.heats.last.position).to eq(10)
      end

      it 'creates the first heat as a semifinal' do
        division.draw
        expect(division.heats.first.round).to eq('Semifinal')
        expect(division.heats.first.position).to eq(0)
      end

      it 'creates the second heat as a semifinal' do
        division.draw
        expect(division.heats.second.round).to eq('Semifinal')
        expect(division.heats.second.position).to eq(1)
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

      it 'should add the athlete to the last heat' do
        division.draw

        expect(division.heats[3].users.size).to eq(5)
        new_athlete = create(:user)

        division.add_athlete(new_athlete)

        expect(division.heats[3].users.size).to eq(6)
        expect(division.heats[3].users.last).to eq(new_athlete)
      end

      it 'does not add more heats' do
        division.draw

        draw_size = division.heats.size
        new_athlete = create(:user)

        division.add_athlete(new_athlete)

        expect(division.heats(true).size).to eq(draw_size)
      end
    end

    describe 'with 22 athletes' do
      let(:division) { create(:division_with_athletes, athletes_count: 22) }

      it 'should add the athlete to the second to last heat' do
        division.draw

        expect(division.heats[2].users.size).to eq(5)
        expect(division.heats[3].users.size).to eq(5)
        new_athlete = create(:user)

        division.add_athlete(new_athlete)

        expect(division.heats[2].users.size).to eq(6)
        expect(division.heats[2].users.last).to eq(new_athlete)
      end

      it 'does not add more heats' do
        division.draw

        draw_size = division.heats.size
        new_athlete = create(:user)

        division.add_athlete(new_athlete)

        expect(division.heats.size).to eq(draw_size)
      end
    end

    describe 'with 25 athletes' do
      let(:division) { create(:division_with_athletes, athletes_count: 25) }

      it 'should add the athlete to the first heat' do
        division.draw

        expect(division.heats.first.users.size).to eq(5)
        new_athlete = create(:user)

        division.add_athlete(new_athlete)

        expect(division.heats.first.users.size).to eq(6)
        expect(division.heats.first.users.last).to eq(new_athlete)
      end

      it 'does not add more heats' do
        division.draw

        draw_size = division.heats.size
        new_athlete = create(:user)

        division.add_athlete(new_athlete)

        expect(division.heats.size).to eq(draw_size)
      end
    end

    describe 'with 24 athletes' do
      let(:division) { create(:division_with_athletes, athletes_count: 24) }

      before(:each) do
        division.draw

        @new_athlete = create(:user)
        division.add_athlete(@new_athlete)
      end

      it 'creates a new round 1 heat with the athlete' do
        first_round = division.heats.where('position < 10')

        expect(first_round.size).to eq(5)
        expect(first_round.last.users.size).to eq(1)
        expect(first_round.last.round).to eq('Round 1')
        expect(first_round.last.position).to eq(4)
        expect(first_round.last.users.first).to eq(@new_athlete)
      end

      it 'renames the round of the first round heats' do
        division.heats.where('position < 10').each do |heat|
          expect(heat.round).to eq('Round 1')
        end
      end

      it 'renames the round of the first round heats' do
        division.heats.where('position < 10').each do |heat|
          expect(heat.round).to eq('Round 1')
        end
      end

      it 'creates a new round of quarterfinals' do
        quarters = division.heats.where(round: 'Quarterfinal')
        expect(quarters.size).to eq(3)

        expect(quarters.first.position).to eq(10)
        expect(quarters.second.position).to eq(11)
        expect(quarters.last.position).to eq(12)
      end

      it 'updates the position of the semis' do
        semis = division.heats.where(round: 'Semifinal')
        expect(semis.size).to eq(2)

        expect(semis.first.position).to eq(20)
        expect(semis.second.position).to eq(21)
      end

      it 'updates the position of the final' do
        final = division.heats.where(round: 'Final')
        expect(final.size).to eq(1)

        expect(final.first.position).to eq(30)
      end
    end

    describe 'with 12 athletes' do
      before(:each) do
        division.draw

        @new_athlete = create(:user)
        division.add_athlete(@new_athlete)
      end

      let(:division) { create(:division_with_athletes, athletes_count: 12) }

      it 'create a new quarterfinal heat with the athlete' do
        first_round = division.heats.where('position < 10')

        expect(first_round.size).to eq(3)
        expect(first_round.last.users.size).to eq(1)
        expect(first_round.last.round).to eq('Quarterfinal')
        expect(first_round.last.position).to eq(2)
        expect(first_round.last.users.first).to eq(@new_athlete)
      end

      it 'renames the round of the first round heats' do
        division.heats.where('position < 10').each do |heat|
          expect(heat.round).to eq('Quarterfinal')
        end
      end

      it 'creates a new round of semifinals' do
        semis = division.heats.where(round: 'Semifinal')
        expect(semis.size).to eq(2)

        expect(semis.first.position).to eq(10)
        expect(semis.last.position).to eq(11)
      end

      it 'updates the position of the final' do
        final = division.heats.where(round: 'Final')
        expect(final.size).to eq(1)

        expect(final.first.position).to eq(20)
      end
    end

    describe 'with 36 athletes' do
      let(:division) { create(:division_with_athletes, athletes_count: 36) }

      before(:each) do
        division.draw

        @new_athlete = create(:user)
        division.add_athlete(@new_athlete)
      end

      it 'creates a new round 1 heat with the athlete' do
        first_round = division.heats.where('position < 10')

        expect(first_round.size).to eq(7)
        expect(first_round.last.users.size).to eq(1)
        expect(first_round.last.round).to eq('Round 1')
        expect(first_round.last.position).to eq(6)
        expect(first_round.last.users.first).to eq(@new_athlete)
      end

      it 'create a new quarterfinal' do
        quarters = division.heats.where(round: 'Quarterfinal')

        expect(quarters.size).to eq(4)
        expect(quarters.last.position).to eq(13)
      end
    end
  end

  describe '#remove_athlete' do
    describe 'with 24 athletes' do
      let(:division) { create(:division_with_athletes) }

      it 'removes the athlete from the heat' do
        division.draw

        quarters = division.heats.where(round: 'Quarterfinal')
        removed_athlete = quarters.last.users.last
        division.remove_athlete(quarters.last.id, removed_athlete.id)

        expect(quarters.last.users.size).to eq(5)
        expect { quarters.last.users.find(removed_athlete.id) }.to raise_error(ActiveRecord::RecordNotFound)
      end

      it 'removes the athlete from the division' do
        division.draw

        quarters = division.heats.where(round: 'Quarterfinal')
        removed_athlete = quarters.last.users.last
        division.remove_athlete(quarters.last.id, removed_athlete.id)

        expect { division.users.find(removed_athlete.id) }.to raise_error(ActiveRecord::RecordNotFound)
      end

      describe 'when removing the last athlete from a heat' do
        before(:each) do
          division.draw
          @new_athlete = create(:user)
          division.add_athlete(@new_athlete)

          @first_round = division.heats.where('position < 10')
        end

        it 'removes the empty heat' do
          division.remove_athlete(@first_round.last.id, @new_athlete.id)
          expect(division.heats.where('position < 10').size).to eq(4)
        end

        it 'renames the round 1 heats to quarters' do
          division.remove_athlete(@first_round.last.id, @new_athlete.id)
          division.heats.where('position < 10').each { |heat| expect(heat.round).to eq('Quarterfinal') }
        end

        it 'removes the extra heats' do
          division.remove_athlete(@first_round.last.id, @new_athlete.id)

          expect(division.heats.where(round: 'Round 1')).to be_empty

          quarters = division.heats.where(round: 'Quarterfinal')
          expect(quarters.size).to be(4)
          expect(quarters.first.position).to be(0)
          expect(quarters.second.position).to be(1)
          expect(quarters[2].position).to be(2)
          expect(quarters.last.position).to be(3)

          semis = division.heats.where(round: 'Semifinal')
          expect(semis.size).to be(2)
          expect(semis.first.position).to be(10)
          expect(semis.second.position).to be(11)

          expect(division.heats.where(round: 'Final').size).to be(1)
          expect(division.heats.where(round: 'Final').first.position).to be(20)
        end
      end
    end
  end
end
