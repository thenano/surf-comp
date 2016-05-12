require 'rails_helper'

RSpec.describe "Heats", :type => :request do
  describe "GET /heats" do
    it "works! (now write some real specs)" do
      get heats_path
      expect(response).to have_http_status(200)
    end
  end
end
