FactoryGirl.define do
  sequence :position do |n|
    n % 7
  end

  factory :athlete_heat do
    position
    association :athlete, factory: :user
    heat
  end
end
