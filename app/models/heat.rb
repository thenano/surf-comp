class Heat
  include Mongoid::Document

  field :name, type: String
  field :time, type: Time

  embeds_many :score_cards

  has_and_belongs_to_many :athletes

  def result
    total_results = {}
    score_cards.each do |score_card|
      score_card.result.each_with_index do |athlete_result, index |
        total_results[athlete_result.athlete.id] ||= 0
        total_results[athlete_result.athlete.id] += index.next
      end
    end
    total_results.sort_by { |athlete_id, total_positions| total_positions }.to_h
  end
end