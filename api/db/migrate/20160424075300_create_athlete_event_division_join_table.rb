class CreateAthleteEventDivisionJoinTable < ActiveRecord::Migration[5.0]
  def change
    create_join_table :event_divisions, :users do |t|
      t.index [:user_id, :event_division_id], unique: true
    end
  end
end
