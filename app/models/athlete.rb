class Athlete
  include Mongoid::Document
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :validatable
  devise :omniauthable, :omniauth_providers => [:facebook]

  field :uid, type: String
  field :name, type: String
  field :image, type: String
  field :provider, type: String
  field :email, type: String, default: ''
  field :encrypted_password, type: String, default: ''
  field :reset_password_token, type: String
  field :reset_password_sent_at, type: Time
  field :current_sign_in_ip, type: String
  field :last_sign_in_ip, type: String
  field :sign_in_count, type: Integer, default: 0
  field :remember_created_at, type: Time
  field :current_sign_in_at, type: Time
  field :last_sign_in_at, type: Time

  validates_presence_of :name, :email

  has_and_belongs_to_many :heats

  def self.from_omniauth(auth)
    where(provider: auth.provider, uid: auth.uid).first_or_create do |athlete|
      athlete.password = Devise.friendly_token[0,20]
      athlete.email = auth.info.email
      athlete.name = auth.info.name
      athlete.image = auth.info.image
    end
  end
end
