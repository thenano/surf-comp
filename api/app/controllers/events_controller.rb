class EventsController < ApplicationController
  before_action :set_event, except: :index

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
      user.email = params[:name].gsub(/\s/, '_') + '@create.com'
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

  def swap_athletes
    params = swap_athletes_params
    athlete1 = AthleteHeat.find_by(heat_id: params[:from][:heat_id], position: params[:from][:position])
    athlete2 = AthleteHeat.find_by(heat_id: params[:to][:heat_id], position: params[:to][:position])

    if athlete2.nil?
      athlete1_previous_heat = athlete1.heat
      if athlete1.update(params[:to])
        if athlete1_previous_heat.athletes.size === 0
          heat_offset = @event.remove_heat(athlete1.heat.event_division.id, athlete1_previous_heat.id)
        end
        render json: {heat_offset: heat_offset.to_i, event: build_event_schedule_json}
      else
        render json: athlete1.errors, status: :unprocessable_entity
      end
    else
      athlete1.update_attribute(:heat_id, nil)
      athlete2.update(params[:from])
      athlete1.update(params[:to])
      render json: {heat_offset: 0, event: build_event_schedule_json}
    end
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

  def end_heat
    @heat = Heat.find(params[:heat_id])
    @heat.event_division.end_heat(@heat)

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
      params.require(:add_athlete).permit(:name, :division_id)
    end

    def remove_athlete_params
      params.require(:remove_athlete).permit(:athlete_id, :division_id, :heat_id)
    end

    def swap_athletes_params
      params.require(:swap_athletes).permit(from: [:heat_id, :position], to: [:heat_id, :position])
    end

    def build_event_schedule_json
      heats = @event.event_divisions.includes(:division, {heats: {athlete_heats: :athlete}}).map do |division|
        division.heats.map do |heat|
          athletes = []
          heat.athlete_heats.each do |athlete_heat|
            athlete = athlete_heat.athlete
            athletes[athlete_heat.position] = {id: athlete.id, name: athlete.name, image: athlete.image, position: athlete_heat.position}
          end

          [heat.id, {
            id: heat.id,
            division: division.division.name,
            division_id: division.division.id,
            round: heat.round,
            round_position: heat.round_position,
            number: heat.position.next,
            time: heat.time,
            athletes: athletes
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
