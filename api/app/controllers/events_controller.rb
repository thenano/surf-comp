class EventsController < ApplicationController
  before_action :set_event, only: [:show, :update, :schedule]

  def show
    render json: @event
  end

  def update
    if @event.update(event_params)
      render json: @event
    else
      render json: @event.errors, status: :unprocessable_entity
    end
  end

  def schedule
    heats = @event.event_divisions.includes(:division, :heats).map do |division|
      division.heats.map do |heat|
        [heat.id, {
          id: heat.id,
          division: division.division.name,
          round: heat.round,
          number: (heat.position % 10).next
        }]
      end
    end

    render json: { schedule: @event.schedule, heats: heats.flatten(1).to_h}
  end

  private
    def set_event
      @event = Event.find(params[:id])
    end

    def event_params
      params.require(:event).permit(:schedule)
    end
end
