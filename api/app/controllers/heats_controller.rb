class HeatsController < ApplicationController
  before_action :set_heat
  before_action :authenticate_user!

  def show
    render json: build_heat_json
  end

  def scores
    render json:  {
      id: @heat.id,
      division: @heat.event_division.division.name,
      division_id: @heat.event_division.division.id,
      round: @heat.round,
      number: @heat.position.next,
      start_time: @heat.start_time,
      athletes: @heat.athlete_heats.map { |athlete_heat|
        athlete = athlete_heat.athlete
        {id: athlete.id, name: athlete.name, image: athlete.image, position: athlete_heat.position}
      },
      scores: user_signed_in? ? @heat.scores_for(current_user.id) : nil
    }
  end

  def add_score
    params = add_score_params
    # begin
      @heat.add_score!(current_user.id, params[:athlete_id], params[:wave], params[:score])
      Pusher.trigger('scores_channel', 'score_added', {
          message: build_heat_json
      })

      render json: build_heat_json
    # rescue Exception => e
    #   render plain: e, status: :unprocessable_entity
    # end
  end

  def start
    @heat.update_attributes!({start_time: Time.now})

    Pusher.trigger("scores-#{@heat.event_division.event.id}", 'heat-started', {
      heat_id: @heat.id
    })

    render status: :no_content
  end

  private
    def set_heat
      @heat = Heat.find(params[:id])
    end

    def add_score_params
      params.require(:score).permit(:athlete_id, :wave, :score)
    end

    def build_heat_json
      athletes = {}
      @heat.athlete_heats.includes(:athlete).each do |athlete_heat|
        athlete = athlete_heat.athlete
        athletes[athlete_heat.id] = {id: athlete.id, name: athlete.name, image: athlete.image, position: athlete_heat.position}
      end

      {
        id: @heat.id,
        division: @heat.event_division.division.name,
        round: @heat.round,
        number: @heat.position.next,
        athletes: athletes,
        result: @heat.result
      }
    end
end
