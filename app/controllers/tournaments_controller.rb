class TournamentsController < ApplicationController
  def create
    @tournament = Tournament.new tournament_params

    @tournament.save!
    redirect_to @tournament
  end

  def new
    @tournament = Tournament.new
  end

  def show
    @tournament = Tournament.find params[:id]
  end

  def index
    @upcoming = []
  end

  def tournament_params
    params.require(:tournament).permit(:date, :name)
  end
end
