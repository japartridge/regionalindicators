class StaticPage < ActiveRecord::Base
  attr_accessible :content, :title, :slug_id, :top, :sort_order

  before_save :set_slug_id

  scope :navbar, where('sort_order IS NOT NULL').where('top IS TRUE').order('sort_order')
  scope :ordered, where('sort_order IS NOT NULL').order('sort_order')
  scope :alpha,   order('title ASC')

  include SlugExtension

  def html
    BlueCloth.new( content ).to_html.html_safe
  end

  def top?
    self.top
  end

  rails_admin do
    list do
      field :id
      field :title
      field :slug_id do
        label 'path'
      end
      field :sort_order
      field :top
    end
  end

  private

    def set_slug_id
      self.slug_id = self.slug
    end

end
