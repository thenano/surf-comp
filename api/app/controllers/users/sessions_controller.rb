class Users::SessionsController < Devise::SessionsController
  clear_respond_to

  respond_to :json

  def current
    if user_signed_in?
      render json: current_user
    else
      render json: 'not logged in', :status => 401
    end
  end
end
