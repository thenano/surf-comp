class CreateEventDivisions < ActiveRecord::Migration[5.0]
  def change
    create_table :event_divisions do |t|
      t.belongs_to :event, foreign_key: true
      t.belongs_to :division, foreign_key: true

      t.timestamps
    end
  end
end
