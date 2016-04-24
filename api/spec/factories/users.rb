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
end
