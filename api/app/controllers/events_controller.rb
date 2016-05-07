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
    athlete = User.where('lower(name) = ?', params[:name].downcase).first_or_create do |user|
      user.password = Devise.friendly_token[0,20]
      user.email = params[:name].replace(/\s/, '_') + '@create.com'
      user.name = params[:name]
    end

    heat_offset = @event.add_athlete(athlete, params[:division_id])

    render json: {heat_offset: heat_offset, event: build_event_schedule_json}
  end

  def remove_athlete
    params = remove_athlete_params

    heat_offset = @event.remove_athlete(params[:athlete_id], params[:division_id], params[:heat_id])

    render json: {heat_offset: heat_offset, event: build_event_schedule_json}
  end

  def update
    if @event.update(event_params)
      schedule
    else
      render json: @event.errors, status: :unprocessable_entity
    end
  end

  def schedule
    render json: build_event_schedule_json
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

    def build_event_schedule_json
      heats = @event.event_divisions.includes(:division, {heats: {athlete_heats: :athlete}}).map do |division|
        division.heats.map do |heat|
          [heat.id, {
            id: heat.id,
            division: division.division.name,
            division_id: division.division.id,
            round: heat.round,
            round_position: heat.round_position,
            number: heat.position.next,
            athletes: heat.athlete_heats.map do |athlete_heat|
              athlete = athlete_heat.athlete
              {id: athlete.id, name: athlete.name, image: athlete.image, position: athlete_heat.position}
            end
          }]
        end
      end

      {
        id: @event.id,
        name: @event.name,
        date: @event.date,
        schedule: @event.schedule,
        heats: heats.flatten(1).to_h
      }
    end
end
