class Users::SessionsController < Devise::SessionsController
  include ActionController::MimeResponds
  
  def current
    if user_signed_in?
      render json: current_user
    else
      render json: 'not logged in', :status => 401
    end
  end
end
