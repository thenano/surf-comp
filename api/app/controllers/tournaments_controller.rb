class TournamentsController < ApplicationController
  def create
    @tournament = Tournament.new tournament_params

    @tournament.save!
    redirect_to @tournament
  end

  def new
    @tournament = Tournament.new
    ['Open', 'Master', 'Grand master', 'Women', 'Micro', 'Junior'].each do |division|
      @tournament.divisions.build(name: division)
    end
  end

  def show
    @tournament = Tournament.find params[:id]
  end

  def index
    @upcoming = Tournament.all
  end

  def tournament_params
    params.require(:tournament).permit(:date, :name, divisions_attributes: [:name, :use])
  end
end
