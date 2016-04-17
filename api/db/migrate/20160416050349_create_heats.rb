class CreateHeats < ActiveRecord::Migration[5.0]
  def change
    create_table :heats do |t|
      t.string :round
      t.time :time
      t.integer :position
      t.belongs_to :division, foreign_key: true

      t.timestamps
    end
  end
end