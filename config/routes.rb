Rails.application.routes.draw do
  devise_for :athletes, :controllers => { :omniauth_callbacks => 'athletes/omniauth_callbacks' }

  root to: 'home#show'
  resources :tournaments
end
