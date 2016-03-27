class Athletes::OmniauthCallbacksController < Devise::OmniauthCallbacksController
  def facebook
    # You need to implement the method below in your model (e.g. app/models/user.rb)
    @athlete = Athlete.from_omniauth(request.env['omniauth.auth'])

    if @athlete.persisted?
      sign_in_and_redirect @athlete, :event => :authentication #this will throw if @athlete is not activated
      set_flash_message(:notice, :success, :kind => 'Facebook') if is_navigational_format?
    else
      session['devise.facebook_data'] = request.env['omniauth.auth']
      redirect_to new_athlete_registration_url
    end
  end

  def failure
    redirect_to root_path
  end
end
