require 'rails_helper'

RSpec.describe ScheduleController, :type => :controller do

  describe 'GET draw' do
    it 'returns http success' do
      get :draw
      expect(response).to have_http_status(:success)
    end
  end

end
