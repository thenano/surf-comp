FactoryGirl.define do
  factory :heat do
    round 'Round'
    position 0
    round_position 0
    event_division

    factory :heat_with_athletes do
      transient do
        athletes_count 6
      end

      after(:create) do |heat, evaluator|
        create_list(:athlete_heat, evaluator.athletes_count, heat: heat)
      end
    end
  end
end
