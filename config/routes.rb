Rails.application.routes.draw do
  devise_for :athletes, :controllers => { :omniauth_callbacks => 'athletes/omniauth_callbacks' }

  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html

  # Serve websocket cable requests in-process
  # mount ActionCable.server => '/cable'
end
