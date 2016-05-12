require "rails_helper"

RSpec.describe HeatsController, :type => :routing do
  describe "routing" do

    it "routes to #index" do
      expect(:get => "/heats").to route_to("heats#index")
    end

    it "routes to #new" do
      expect(:get => "/heats/new").to route_to("heats#new")
    end

    it "routes to #show" do
      expect(:get => "/heats/1").to route_to("heats#show", :id => "1")
    end

    it "routes to #edit" do
      expect(:get => "/heats/1/edit").to route_to("heats#edit", :id => "1")
    end

    it "routes to #create" do
      expect(:post => "/heats").to route_to("heats#create")
    end

    it "routes to #update" do
      expect(:put => "/heats/1").to route_to("heats#update", :id => "1")
    end

    it "routes to #destroy" do
      expect(:delete => "/heats/1").to route_to("heats#destroy", :id => "1")
    end

  end
end
