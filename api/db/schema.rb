# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20160507095022) do

  create_table "athlete_heats", force: :cascade do |t|
    t.integer  "heat_id"
    t.integer  "athlete_id"
    t.integer  "position"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["athlete_id", "heat_id"], name: "index_athlete_heats_on_athlete_id_and_heat_id", unique: true
    t.index ["heat_id"], name: "index_athlete_heats_on_heat_id"
    t.index ["position", "heat_id"], name: "index_athlete_heats_on_position_and_heat_id", unique: true
  end

  create_table "divisions", force: :cascade do |t|
    t.string   "name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "event_divisions", force: :cascade do |t|
    t.integer  "event_id"
    t.integer  "division_id"
    t.datetime "created_at",  null: false
    t.datetime "updated_at",  null: false
    t.index ["division_id"], name: "index_event_divisions_on_division_id"
    t.index ["event_id"], name: "index_event_divisions_on_event_id"
  end

  create_table "event_divisions_users", id: false, force: :cascade do |t|
    t.integer "event_division_id", null: false
    t.integer "user_id",           null: false
    t.index ["user_id", "event_division_id"], name: "index_event_divisions_users_on_user_id_and_event_division_id", unique: true
  end

  create_table "events", force: :cascade do |t|
    t.string   "name"
    t.date     "date"
    t.text     "schedule"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "heats", force: :cascade do |t|
    t.string   "round"
    t.time     "start_time"
    t.time     "end_time"
    t.integer  "position"
    t.integer  "round_position"
    t.text     "scores"
    t.integer  "event_division_id"
    t.datetime "created_at",        null: false
    t.datetime "updated_at",        null: false
    t.index ["event_division_id"], name: "index_heats_on_event_division_id"
  end

  create_table "users", force: :cascade do |t|
    t.string   "email",                  default: "", null: false
    t.string   "encrypted_password",     default: "", null: false
    t.string   "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer  "sign_in_count",          default: 0,  null: false
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.string   "current_sign_in_ip"
    t.string   "last_sign_in_ip"
    t.string   "provider"
    t.string   "uid"
    t.string   "name"
    t.string   "image"
    t.datetime "created_at",                          null: false
    t.datetime "updated_at",                          null: false
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
  end

end
