class CreateEvents < ActiveRecord::Migration[5.0]
  def change
    create_table :events do |t|
      t.string :name
      t.date :date
      t.integer :current_schedule_index, default: 0
      t.text :schedule

      t.timestamps
    end
  end
end
