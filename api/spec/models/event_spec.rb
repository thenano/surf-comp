require 'rails_helper'

RSpec.describe Event, :type => :model do
  describe '#draw' do
    let(:event) { create(:event) }
    let(:event_division1) { create(:division_with_athletes, {event: event}) }
    let(:event_division2) { create(:division_with_athletes, {event: event}) }

    it 'creates the schedule with the draw' do
      event.reload
      p event_division1
      p event_division2
      p event
      p event.event_divisions
      event.draw

      expect(event.schedule).to eq([
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
        []
      ])
    end
  end
end
