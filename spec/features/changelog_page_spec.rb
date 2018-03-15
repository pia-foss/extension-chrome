require_relative 'setup'

RSpec.describe 'changelog page', type: :feature do
  before do
    visit popup_path
    login_successfully
    click_extension_settings_button
    click_on 'View Changelog'
  end

  it 'renders the changelog' do
    within('#changelog') do
      expect(page).to have_selector('ul'), 'changelog is missing'
    end
  end
end
