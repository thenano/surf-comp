class CreateScores < ActiveRecord::Migration[5.0]
  def change
    create_table :scores do |t|
      t.belongs_to :heat, foreign_key: true
      t.integer :judge_id
      t.integer :athlete_id
      t.integer :wave
      t.float :score

      t.index [:judge_id, :heat_id, :athlete_id, :wave], unique: true

      t.timestamps
    end
    add_foreign_key :scores, :users, column: :judge_id
    add_foreign_key :scores, :users, column: :athlete_id
  end
end
