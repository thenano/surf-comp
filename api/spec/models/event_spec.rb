require 'rails_helper'

RSpec.describe Event, :type => :model do
  describe '#draw' do
    it 'creates the schedule with the draw' do
      event = create(:event)
      create(:division_with_athletes, {event: event})
      create(:division_with_athletes, {event: event})

      event.draw

      expect(event.schedule).to eq([
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
        []
      ])
    end
  end

  describe '#add_athlete' do
    describe 'when there is a division with 24 athletes' do
      let(:event) { create(:event) }
      before :each do
        @division1 = create(:division_with_athletes, {event: event})
        @division2 = create(:division_with_athletes, {event: event})

        event.draw

        @new_athlete = create(:user)
      end

      it 'adds the new round after the previous round and maintains subsequent round positions in the schedule' do
        event.update_attribute(:schedule, [
            [1, 3, 8, 9, 10, 11, 5, 6, 12, 13, 7, 14],
            [2, 4]
        ])
        event.add_athlete(@new_athlete, @division1.id)

        expect(event.schedule).to eq([
          [1, 3, 15, 16, 17, 18, 8, 9, 10, 11, 19, 20, 12, 13, 21, 14],
          [2, 4, 0, 0, 0, 0]
        ])
      end

      it 'adds the new round after the previous round in bank 2' do
        event.update_attribute(:schedule, [
            [1, 2, 03, 04, 05, 06, 07],
            [8, 9, 10, 11, 12, 13, 14]
        ])
        event.add_athlete(@new_athlete, @division2.id)

        expect(event.schedule).to eq([
            [1, 2, 03, 04, 00, 00, 00, 00, 05, 06, 07],
            [8, 9, 10, 11, 15, 16, 17, 18, 19, 20, 21]
        ])
      end

      it 'replaces final round heats in the second bank as well and adds empty spots' do
        event.update_attribute(:schedule, [
            [1, 2, 3, 4, 8, 9, 10, 11, 5, 12, 07],
            [0, 0, 0, 0, 0, 0, 00, 00, 6, 13, 14]
        ])
        event.add_athlete(@new_athlete, @division1.id)

        expect(event.schedule).to eq([
            [1, 2, 3, 4, 15, 16, 17, 18, 8, 9, 10, 11, 19, 12, 21],
            [0, 0, 0, 0, 00, 00, 00, 00, 0, 0, 00, 00, 20, 13, 14]
        ])
      end
    end

    describe 'when there is a division with 36 athletes' do
      let(:event) { create(:event) }

      before :each do
        @division1 = create(:division_with_athletes, athletes_count: 36, event: event)
        @division2 = create(:division_with_athletes, {event: event})

        event.draw

        @new_athlete = create(:user)
      end

      it 'adds the new heats after the last heats of each round' do
        event.add_athlete(@new_athlete, @division1.id)

        expect(event.schedule).to eq([
            [1, 2, 3, 4, 5, 6, 20, 21, 22, 23, 24, 25, 26, 27, 13, 14, 15, 16, 17, 18, 19],
            [nil, nil, nil, nil, nil, nil, 0, nil, nil, nil, 0]
        ])
      end

      it 'adds the new heats after the last heats of each round in between the other division' do
        event.update_attribute(:schedule, [
            [1, 2, 3,  7,  8,  9, 00, 10, 17, 19],
            [4, 5, 6, 13, 14, 15, 16, 11, 18, 12]
        ])

        event.add_athlete(@new_athlete, @division1.id)

        expect(event.schedule).to eq([
            [1, 2, 3, 20, 21, 22, 23, 24, 00, 25, 17, 19],
            [4, 5, 6, 00, 13, 14, 15, 00, 16, 26, 18, 27]
        ])
      end

    end

    describe 'when there is a division with 48 athletes' do
      let(:event) { create(:event) }

      before :each do
        @division1 = create(:division_with_athletes, athletes_count: 48, event: event)

        event.draw

        @new_athlete = create(:user)
      end

      it 'adds the new heats and removes the unnecessary quarter' do
        event.add_athlete(@new_athlete, @division1.id)

        expect(event.schedule).to eq([
          [1, 2, 3, 4, 5, 6, 7, 8, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27],
          [nil, nil, nil, nil, nil, nil, nil, nil, 0, 0, 0, 0, 0, 0]
        ])
      end

      it 'adds the new heats, removes the unnecessary quarter and removes the gap' do
        event.update_attribute(:schedule, [
          [1, 2, 3, 4, 9, 10, 11, 12, 13, 15],
          [5, 6, 7, 8, 0, 00, 00, 00, 14]
        ])
        event.add_athlete(@new_athlete, @division1.id)

        expect(event.schedule).to eq([
          [1, 2, 3, 4, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 27],
          [5, 6, 7, 8, 00, 00, 00, 00, 00, 00, 00, 00, 00, 26]
        ])
      end

    end

    describe 'when there is a division with 23 athletes' do
      let(:event) { create(:event) }

      before :each do
        @division1 = create(:division_with_athletes, athletes_count: 23, event: event)
        event.draw

        @new_athlete = create(:user)
      end

      it 'adds the the athlete to the existing heat and does not change the schedule' do
        event.add_athlete(@new_athlete, @division1.id)

        expect(event.schedule).to eq([
            [1, 2, 3, 4, 5, 6, 7],
            []
        ])
      end

    end
  end

  describe '#remove_athlete' do

    describe 'when there is a division with 25 athletes' do
      let(:event) { create(:event) }
      before :each do
        @division1 = create(:division_with_athletes, {event: event})
        @division2 = create(:division_with_athletes, {event: event})

        event.draw

        @new_athlete = create(:user)
      end

      it 'removes the second round and maintains subsequent round positions in the schedule' do
        event.update_attribute(:schedule, [
          [1, 3, 8, 9, 10, 11, 5, 6, 12, 13, 7, 14],
          [2, 4]
        ])
        event.add_athlete(@new_athlete, @division1.id)
        event.remove_athlete(@new_athlete.id, @division1.id, @division1.heats.where(round_position: 0).last.id)

        expect(event.schedule).to eq([
          [1, 3, 8, 9, 10, 11, 22, 23, 12, 13, 24, 14],
          [2, 4]
        ])
      end

      it 'removes the new round in bank 2' do
        event.update_attribute(:schedule, [
          [1, 2, 03, 04, 05, 06, 07],
          [8, 9, 10, 11, 12, 13, 14]
        ])
        event.add_athlete(@new_athlete, @division2.id)
        event.remove_athlete(@new_athlete.id, @division2.id, @division2.heats.where(round_position: 0).last.id)

        expect(event.schedule).to eq([
          [1, 2, 03, 04, 05, 06, 07],
          [8, 9, 10, 11, 22, 23, 24]
        ])
      end

      it 'replaces final round heats in the second bank as well and removes empty spots' do
        event.update_attribute(:schedule, [
          [1, 2, 3, 4, 8, 9, 10, 11, 5, 12, 07],
          [0, 0, 0, 0, 0, 0, 00, 00, 6, 13, 14]
        ])
        event.add_athlete(@new_athlete, @division1.id)
        event.remove_athlete(@new_athlete.id, @division1.id, @division1.heats.where(round_position: 0).last.id)

        expect(event.schedule).to eq([
          [1, 2, 3, 4, 8, 9, 10, 11, 22, 12, 24],
          [0, 0, 0, 0, 0, 0, 00, 00, 23, 13, 14]
        ])
      end

      it 'replaces the removed heat with an empty slot if there is a heat in another bank' do
        event.add_athlete(@new_athlete, @division1.id)
        event.update_attribute(:schedule, [
          [1, 3, 15, 16, 17, 18, 19, 20, 12, 13, 21, 14],
          [2, 4,  8,  9, 10, 11]
        ])
        event.remove_athlete(@new_athlete.id, @division1.id, @division1.heats.where(round_position: 0).last.id)

        expect(event.schedule).to eq([
          [1, 3, 22, 23, 12, 13, 24, 14],
          [2, 4, 8,  9, 10, 11]
        ])
      end
    end

    describe 'when there is a division with 37 athletes' do
      let(:event) { create(:event) }

      before :each do
        @division1 = create(:division_with_athletes, athletes_count: 36, event: event)
        @division2 = create(:division_with_athletes, {event: event})

        event.draw

        @new_athlete = create(:user)
      end

      it 'removes the new heats after the last heats of each round' do
        event.add_athlete(@new_athlete, @division1.id)
        event.remove_athlete(@new_athlete.id, @division1.id, @division1.heats.where(round_position: 0).last.id)

        expect(event.schedule).to eq([
          [1, 2, 3, 4, 5, 6, 28, 29, 30, 31, 32, 33, 13, 14, 15, 16, 17, 18, 19],
          [nil, nil, nil, nil, nil, nil, nil, nil, nil]
        ])
      end

      it 'removes the heats after the last heats of each round in between the other division' do
        event.update_attribute(:schedule, [
          [1, 2, 3,  7,  8,  9, 00, 10, 17, 19],
          [4, 5, 6, 13, 14, 15, 16, 11, 18, 12]
        ])

        event.add_athlete(@new_athlete, @division1.id)
        event.remove_athlete(@new_athlete.id, @division1.id, @division1.heats.where(round_position: 0).last.id)

        expect(event.schedule).to eq([
          [1, 2, 3, 28, 29, 30, 00, 31, 17, 19],
          [4, 5, 6, 13, 14, 15, 16, 32, 18, 33]
        ])
      end

    end

    describe 'when there is a division with 49 athletes' do
      let(:event) { create(:event) }
      before :each do
        @division1 = create(:division_with_athletes, athletes_count: 48, event: event)

        event.draw

        @new_athlete = create(:user)
      end

      it 'removes the heats and add the new quarter' do
        event.add_athlete(@new_athlete, @division1.id)
        event.remove_athlete(@new_athlete.id, @division1.id, @division1.heats.where(round_position: 0).last.id)

        expect(event.schedule).to eq([
          [1, 2, 3, 4, 5, 6, 7, 8, 28, 29, 30, 31, 32, 33, 34],
          [nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, 0]
        ])
      end

    end

    describe 'when there is a division with 24 athletes' do
      let(:event) { create(:event) }

      before :each do
        @division1 = create(:division_with_athletes, event: event)
        event.draw
      end

      it 'removes the athlete and does not change the schedule' do
        event.remove_athlete(@division1.heats.where(round_position: 0).last.users.first.id, @division1.id, @division1.heats.where(round_position: 0).last.id)

        expect(event.schedule).to eq([
          [1, 2, 3, 4, 5, 6, 7],
          []
        ])
      end

    end
  end
end
