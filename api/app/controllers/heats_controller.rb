class HeatsController < ApplicationController
  before_action :set_heat
  before_action :authenticate_user!

  def show
    render json: build_heat_json
  end

  def add_score
    score = add_score_params.merge({judge_id: current_user.id})
    begin
      @heat.add_score!(score)
      Pusher.trigger("scores-#{@heat.event_division.event.id}", 'score-changed', {
          message: build_heat_json
      })

      render json: build_heat_json
    rescue Exception => e
      render plain: e.message, status: :unprocessable_entity
    end
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
