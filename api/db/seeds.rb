# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: 'Star Wars' }, { name: 'Lord of the Rings' }])
#   Character.create(name: 'Luke', movie: movies.first)

event = FactoryGirl.create(:event, name: 'Trial comp', date: '2016-05-14')
groms = FactoryGirl.create(:division, name: 'Trial crew')

['Ian Wallace',
'Felix Ettelson',
'Lara Demelian',
'Luke Adam',
'Archie MacDonald',
'Finn Fillipek',
'Jack Hobbs',
'Andreas Thoma',
'Saul Hirner',
'Izzie Cremer',
'Nic Mcgrath'].each { |athlete| FactoryGirl.create(:user, name: athlete)}

EventDivision.create(event: event, division: groms, users: User.all)

event.draw