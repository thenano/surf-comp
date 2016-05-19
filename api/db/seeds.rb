# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: 'Star Wars' }, { name: 'Lord of the Rings' }])
#   Character.create(name: 'Luke', movie: movies.first)
require 'csv'

event = Event.create(name: 'BBR comp 3', date: '2016-05-22')

CSV.foreach('./db/comp3_seeds.csv', headers: true) do |row|
  division = Division.find_by(name: row['DIVISON'].downcase.capitalize)
  if division.nil?
    division = Division.create(name: row['DIVISON'].downcase.capitalize)
    event_division = EventDivision.create(event: event, division: division)
  else
    event_division = EventDivision.find_by(division_id: division.id)
  end
  event_division.users.create(password: Devise.friendly_token[0,20],
              email: row['NAME'].gsub(/\s/, '_') + '@created.com',
              name: row['NAME'])
end

event.draw
