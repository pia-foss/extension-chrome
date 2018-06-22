require_relative 'setup'
RSpec.describe 'Page shown on authentication failure', type: :feature do
  describe 'page content' do
    before do
      visit authfail_path
    end

    specify 'includes title, message' do
      expect(page.title).to eq(t('AuthFailPageTitle'))
      expect(page).to have_content(t('AuthFailTitle'))
      expect(page.body).to include(t('AuthFailMessage'))
    end

    specify 'clicking on "support team" opens helpdesk' do
      click_on "support team"
      expect(current_url).to eq("https://www.privateinternetaccess.com/helpdesk/")
    end
  end

  specify 'authfail.html is shown when proxy auth fails' do
    visit popup_path
    login_successfully
    jseval("app.util.storage.setItem('form:username', 'blah', app.util.user.storageBackend())")
    toggle_switch 'on'
    visit 'https://www.privateinternetaccess.com/robots.txt'
    expect(current_url).to eq(authfail_path)
  end
end
