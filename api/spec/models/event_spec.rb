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
end
