# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: 'Star Wars' }, { name: 'Lord of the Rings' }])
#   Character.create(name: 'Luke', movie: movies.first)

event = Event.create(name: 'BBR comp 3', date: '2016-22-05')

CSV.foreach('./db/comp3_seeds.csv', headers: true) do |row|
  division = Division.find_by(name: row['DIVISON'])
  if division.nil?
    division = Division.create(name: row['DIVISON'])
    event_division = EventDivision.create(event: event, division: division)
  else
    event_division = EventDivision.find_by(division_id: division.id)
  end
  event_division.users.create(password: Devise.friendly_token[0,20],
              email: row['NAME'].gsub(/\s/, '_') + '@create.com',
              name: row['NAME'])
end

event.draw

# event = FactoryGirl.create(:event, name: 'Trial comp', date: '2016-05-14')
# groms = FactoryGirl.create(:division, name: 'Trial crew')
#
# ['Ian Wallace',
# 'Felix Ettelson',
# 'Lara Demelian',
# 'Luke Adam',
# 'Archie MacDonald',
# 'Finn Fillipek',
# 'Jack Hobbs',
# 'Andreas Thoma',
# 'Saul Hirner',
# 'Izzie Cremer',
# 'Nic Mcgrath'].each { |athlete| FactoryGirl.create(:user, name: athlete)}
#
# EventDivision.create(event: event, division: groms, users: User.all)
#
# User.create!(email: 'admin@example.com', password: 'password', password_confirmation: 'password')