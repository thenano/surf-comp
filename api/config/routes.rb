Rails.application.routes.draw do
  scope '/api', defaults: {format: :json} do
    resources :events, only: [:index, :show, :update] do
      get 'schedule', on: :member
      post 'add_athlete', on: :member
      put 'remove_athlete', on: :member
      put 'swap_athletes', on: :member
      get 'current_heats', on: :member

      patch '/heats/:heat_id/end', on: :member, action: :end_heat
    end

    resources :heats, only: [:show] do
      put 'add_score', on: :member
      patch 'start', on: :member
    end

    devise_for :users, controllers: {sessions: 'users/sessions', registrations: 'users/registrations', :omniauth_callbacks => 'users/omniauth_callbacks'}

    devise_scope :user do
      get '/users/current', to: 'users/sessions#current'
    end

    post '/pubsubauth', to: 'pusher#auth'
  end

  # Serve websocket cable requests in-process
  # mount ActionCable.server => '/cable'
end
