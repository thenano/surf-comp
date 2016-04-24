# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: 'Star Wars' }, { name: 'Lord of the Rings' }])
#   Character.create(name: 'Luke', movie: movies.first)

event = FactoryGirl.create(:event)
groms = FactoryGirl.create(:division, name: 'Groms')
women = FactoryGirl.create(:division, name: 'Women')
opens = FactoryGirl.create(:division, name: 'Open')

FactoryGirl.create(:division_with_athletes, {event: event, division: groms})
FactoryGirl.create(:division_with_athletes, {event: event, division: women, athletes_count: 14})
FactoryGirl.create(:division_with_athletes, {event: event, division: opens, athletes_count: 25})

event.draw