class Users::SessionsController < Devise::SessionsController
  include ActionController::MimeResponds

  clear_respond_to
  respond_to :json

  def current
    if user_signed_in?
      render json: current_user
    else
      render status: :no_content
    end
  end
end
