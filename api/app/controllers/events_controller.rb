class EventsController < ApplicationController
  before_action :set_event, only: [:show, :update, :schedule]

  def index
    @events = Event.all
    render json: @events
  end

  def show
    render json: @event
  end

  def update
    if @event.update(event_params)
      schedule
    else
      render json: @event.errors, status: :unprocessable_entity
    end
  end

  def schedule
    heats = @event.event_divisions.includes(:division, :heats, :users).map do |division|
      division.heats.map do |heat|
        [heat.id, {
            id: heat.id,
            division: division.division.name,
            round: heat.round,
            number: (heat.position % 10).next,
            users: heat.users.map { |athlete| {id: athlete.id, name: athlete.name, image: athlete.image} }
        }]
      end
    end

    render json: {
      id: @event.id,
      name: @event.name,
      schedule: @event.schedule,
      heats: heats.flatten(1).to_h
    }
  end

  private
    def set_event
      @event = Event.find(params[:id])
    end

    def event_params
      permitted = params.require(:event).permit
      permitted[:schedule] = params.require(:event).require(:schedule) if params.require(:event).has_key?(:schedule)
      permitted
    end
end
