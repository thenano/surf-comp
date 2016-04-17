class CreateAthleteHeatJoinTable < ActiveRecord::Migration[5.0]
  def change
    create_join_table :heats, :users do |t|
      # t.index [:heat_id, :user_id]
      t.index [:user_id, :heat_id], unique: true
    end
  end
end
