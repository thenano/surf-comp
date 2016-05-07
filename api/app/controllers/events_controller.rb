class EventsController < ApplicationController
  before_action :set_event, only: [:show, :update, :schedule, :add_athlete, :remove_athlete]

  def index
    @events = Event.all
    render json: @events
  end

  def show
    render json: {
      id: @event.id,
      name: @event.name,
      date: @event.date,
      schedule: @event.schedule,
      divisions: @event.event_divisions.includes(:division).map{ |division|
        [division.division.id, {id: division.division.id, name: division.division.name, athletes: division.users.size}]
      }.to_h
    }
  end

  def add_athlete
    params = add_athlete_params
    athlete = User.where(name: params[:name]).first_or_create do |user|
      user.password = Devise.friendly_token[0,20]
      user.email = params[:name].replace(/\s/, '_') + '@create.com'
      user.name = params[:name]
    end
    old_heat_size = @event.schedule.flatten.size
    @event.add_athlete(athlete, params[:division_id])
    new_heat_size = @event.schedule.flatten.size

    render json: {heat_offset: new_heat_size - old_heat_size}
  end

  def remove_athlete
    params = remove_athlete_params

    old_heat_size = @event.schedule.flatten.size
    @event.remove_athlete(params[:athlete_id], params[:division_id], params[:heat_id])
    new_heat_size = @event.schedule.flatten.size

    schedule
  end

  def update
    if @event.update(event_params)
      schedule
    else
      render json: @event.errors, status: :unprocessable_entity
    end
  end

  def schedule
    heats = @event.event_divisions.includes(:division, {heats: :users}).map do |division|
      division.heats.map do |heat|
        [heat.id, {
            id: heat.id,
            division: division.division.name,
            division_id: division.division.id,
            round: heat.round,
            round_position: heat.round_position,
            number: heat.position.next,
            athletes: heat.users.map { |athlete| {id: athlete.id, name: athlete.name, image: athlete.image} }
        }]
      end
    end

    render json: {
      id: @event.id,
      name: @event.name,
      date: @event.date,
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

    def add_athlete_params
      params.require(:add_athlete).permit(:name, :division_id, :heat_id)
    end

    def remove_athlete_params
      params.require(:remove_athlete).permit(:athlete_id, :division_id, :heat_id)
    end
end
