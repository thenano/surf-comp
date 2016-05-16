class CreateHeats < ActiveRecord::Migration[5.0]
  def change
    create_table :heats do |t|
      t.string :round
      t.time :start_time
      t.time :end_time

      t.integer :position
      t.integer :round_position
      t.text :scores
      t.belongs_to :event_division, foreign_key: true

      t.timestamps
    end
  end
end
