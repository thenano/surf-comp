class CreateAthleteHeats < ActiveRecord::Migration[5.0]
  def change
    create_table :athlete_heats do |t|
      t.belongs_to :heat, foreign_key: true
      t.integer :athlete_id
      t.integer :position

      t.index [:position, :heat_id], unique: true
      t.index [:athlete_id, :heat_id], unique: true

      t.timestamps
    end
    add_foreign_key :athlete_heats, :users, column: :athlete_id
  end
end
