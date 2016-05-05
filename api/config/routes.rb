Rails.application.routes.draw do
  scope '/api' do
    resources :events, only: [:index, :show, :update] do
      get 'schedule', on: :member
      get 'add_athlete', on: :member
      post 'remove_athlete', on: :member
    end

    devise_for :users, controllers: {sessions: 'users/sessions', registrations: 'users/registrations', :omniauth_callbacks => 'users/omniauth_callbacks'}, defaults: {format: :json}

    devise_scope :user do
      get '/users/current', to: 'users/sessions#current', defaults: {format: :json}
    end
  end

  # Serve websocket cable requests in-process
  # mount ActionCable.server => '/cable'
end
