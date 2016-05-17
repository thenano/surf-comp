FactoryGirl.define do
  sequence :position do |n|
    (n-1) % 6
  end

  factory :athlete_heat do
    position
    association :athlete, factory: :user
    heat
  end
end
