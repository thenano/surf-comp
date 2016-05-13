class CreateAthleteHeats < ActiveRecord::Migration[5.0]
  def change
    create_table :athlete_heats do |t|
      t.belongs_to :heat, foreign_key: true
      t.belongs_to :user, foreign_key: :athlete_id
      t.integer :position

      t.index [:position, :heat_id], unique: true
      t.index [:athlete_id, :heat_id], unique: true

      t.timestamps
    end
  end
end
