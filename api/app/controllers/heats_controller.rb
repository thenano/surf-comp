class HeatsController < ApplicationController
  before_action :set_heat
  before_action :authenticate_user!, only: [:add_score]

  def show
    athletes = []
    @heat.athlete_heats.includes(:athlete).each do |athlete_heat|
      athlete = athlete_heat.athlete
      athletes[athlete_heat.position] = {id: athlete.id, name: athlete.name, image: athlete.image, position: athlete_heat.position}
    end

    render json: {
        id: @heat.id,
        division: @heat.event_division.division.name,
        round: @heat.round,
        number: @heat.position.next,
        athletes: athletes,
        result: @heat.result
    }
  end

  def add_score
    params = add_score_params
    params[:judge_id] = current_user.id
    begin
      @heat.add_score(*params)
      show
    rescue Exception => e
      render json: e, status: :unprocessable_entity
    end
  end

  private
    def set_heat
      @heat = Heat.find(params[:id])
    end

    def add_score_params
      params.require(:score).permit(:athlete_id, :wave, :score)
    end
end
