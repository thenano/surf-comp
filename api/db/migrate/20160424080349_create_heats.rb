class CreateHeats < ActiveRecord::Migration[5.0]
  def change
    create_table :heats do |t|
      t.string :round
      t.datetime :start_time
      t.datetime :end_time

      t.integer :position
      t.integer :round_position
      t.belongs_to :event_division, foreign_key: true

      t.timestamps
    end
  end
end
