FactoryGirl.define do
  sequence :name do |n|
    "Jennifer #{n}"
  end

  sequence :email do |n|
    "email#{n}@email.com"
  end

  factory :user do
    name
    email
    password 'Password123'
    password_confirmation 'Password123'
  end

  factory :division do
    name 'Women'

    factory :division_with_athletes do
      transient do
        athletes_count 6*4
      end

      after(:create) do |division, evaluator|
        create_list(:user, evaluator.athletes_count, divisions: [division])
      end
    end
  end
end