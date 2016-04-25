require 'rails_helper'

RSpec.describe EventsController, :type => :controller do
  describe 'GET schedule' do
    it 'returns http success' do
      get :schedule, params: {id: 1}
      expect(response).to have_http_status(:success)
    end
  end
end
