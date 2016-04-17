class Users::RegistrationsController < Devise::RegistrationsController
  include ActionController::MimeResponds

  clear_respond_to
  respond_to :json

  before_action :configure_permitted_parameters

  private
    def configure_permitted_parameters
      devise_parameter_sanitizer.permit(:sign_up, keys: [:name])
    end
end
