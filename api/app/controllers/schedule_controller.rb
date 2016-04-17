class ScheduleController < ApplicationController
  def draw
    @divisions = Division.all
    @divisions.each(&:draw)

    render json: @divisions, root: false
  end
end
