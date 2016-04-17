Rails.application.routes.draw do
  get 'schedule/draw'

  devise_for :users, controllers: {sessions: 'users/sessions', registrations: 'users/registrations', :omniauth_callbacks => 'users/omniauth_callbacks'}, defaults: {format: :json}

  # For details on the DSL available within this file, see
  # http://guides.rubyonrails.org/routing.html
  

  devise_scope :user do
    get '/users/current', to: 'users/sessions#current', defaults: {format: :json}
  end

  # Serve websocket cable requests in-process
  # mount ActionCable.server => '/cable'
end
