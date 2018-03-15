require_relative 'setup'
RSpec.describe 'Page shown on connection failure', type: :feature do
  before do
    visit popup_path
    login_successfully
    toggle_switch 'on'
    @id = jseval "app.util.errorinfo.set('net::ERR_CONNECTION_RESET', 'https://www.privateinternetaccess.com/robots.txt')"
  end

  specify "reloading the page opens the URL that had a connection error" do
    visit "#{connfail_path(@id)}#reload"
    expect(current_url).to eq('https://www.privateinternetaccess.com/robots.txt')
  end

  describe 'page contents' do
    before do
      visit connfail_path(@id)
    end

    specify 'includes title, message, name of error and try again button' do
      expect(page.title).to eq(t('ConnectionFailPageTitle'))
      expect(page).to have_content(t('ConnectionFailTitle'))
      expect(page).to have_content(t('ConnectionFailMessage'))
      expect(page).to have_content("net::ERR_CONNECTION_RESET")
      expect(page).to have_selector("a#try-again", text: t("TryAgain").upcase)
    end
  end

  describe 'Try Again button' do
    before do
      visit connfail_path(@id)
    end

    specify 'clicking the button opens the URL that had a connection error' do
      click_on t("TryAgain")
      expect(current_url).to eq("https://www.privateinternetaccess.com/robots.txt")
    end

    specify 'clicking button removes errorinfo' do
      click_on t("TryAgain")
      visit popup_path
      expect(jseval("app.util.errorinfo.get('#{@id}')")).to be_empty
    end
  end
end
