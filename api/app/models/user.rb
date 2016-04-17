class User < ApplicationRecord
  has_and_belongs_to_many :divisions
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :validatable
  devise :omniauthable, :omniauth_providers => [:facebook]

  validates_presence_of :name, :email

  def self.from_omniauth(auth)
    where(provider: auth.provider, uid: auth.uid).first_or_create do |user|
      user.password = Devise.friendly_token[0,20]
      user.email = auth.info.email
      user.name = auth.info.name
      user.image = auth.info.image
    end
  end
end
