class Users::OmniauthCallbacksController < Devise::OmniauthCallbacksController
  def facebook
    @user = User.from_omniauth(request.env['omniauth.auth'])

    if @user.persisted?
      render json: @user
    else
      session['devise.facebook_data'] = request.env['omniauth.auth']
      render json: session['devise.facebook_data']
    end
  end

  def failure
    render json: params
  end
end
