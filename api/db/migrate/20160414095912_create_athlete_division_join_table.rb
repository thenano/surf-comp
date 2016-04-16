class CreateAthleteDivisionJoinTable < ActiveRecord::Migration[5.0]
  def change
    create_join_table :divisions, :users do |t|
      # t.index [:division_id, :user_id]
      t.index [:user_id, :division_id], unique: true
    end
  end
end
