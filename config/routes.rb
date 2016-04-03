Rails.application.routes.draw do
  devise_for :athletes, :controllers => { :omniauth_callbacks => 'athletes/omniauth_callbacks' }

  get '/', to: 'home#show'
end
