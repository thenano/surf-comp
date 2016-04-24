FactoryGirl.define do
  factory :event_division do
    event
    division

    factory :division_with_athletes do
      transient do
        athletes_count 6*4
      end

      after(:create) do |event_division, evaluator|
        create_list(:user, evaluator.athletes_count, event_divisions: [event_division])
      end
    end
  end
end
