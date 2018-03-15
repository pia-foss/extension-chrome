require_relative 'setup'
RSpec.describe 'login page', type: :feature do
  before do
    visit popup_path
  end

  context 'when authentication fails' do
    specify 'the login form includes an error message' do
      login username: SecureRandom.hex, password: SecureRandom.hex
      expect(page).to have_css('.text-danger', text: t('WrongUsernameAndPassword'))
    end
  end

  context 'when authentication succeeds' do
    specify 'the authenticated page is rendered' do
      login_successfully
      expect(page).to have_css('#authenticated-template')
    end
  end

  context 'the "reset password" link' do
    specify 'opens the reset password page', pending: true do
      new_tab = window_opened_by { click_on "Reset Password" }
      within_window(new_tab) do
        expect(current_url).to eq("https://www.privateinternetaccess.com/pages/reset-password")
      end
    end
  end

  context 'the "remember me" checkbox' do
    specify 'it is checked by default' do
      expect(find('input[name="rememberme"]')).to be_checked
    end

    specify 'when checked the username and password are copied to local storage' do
      fill_in_username 'p1234567'
      fill_in_password 'testpassword'
      check 'rememberme'
      expect(localstorage_username).to eq('p1234567')
      expect(localstorage_password).to eq('testpassword')
    end

    specify 'when checked the username and password are removed from memory' do
      fill_in_username 'p1234567'
      fill_in_password 'testpassword'
      check 'rememberme'
      expect(inmemory_username).to eq(nil)
      expect(inmemory_password).to eq(nil)
    end

    specify 'when unchecked the username and password are copied to memory' do
      check 'rememberme'
      fill_in_username 'p1234567'
      fill_in_password 'testpassword'
      uncheck 'rememberme'
      expect(inmemory_username).to eq('p1234567')
      expect(inmemory_password).to eq('testpassword')
    end

    specify 'when unchecked the username and password are removed from local storage' do
      check 'rememberme'
      fill_in_username 'p1234567'
      fill_in_password 'testpassword'
      uncheck 'rememberme'
      expect(localstorage_username).to eq(nil)
      expect(localstorage_password).to eq(nil)
    end
  end

  describe 'bugs and issues found by users and QA' do
    specify 'login continues to work after switching from local storage to memory storage' do
      check "rememberme"
      fill_in_username "foo"
      fill_in_password "bar"
      uncheck "rememberme"
      fill_in_username test_username
      fill_in_password test_password
      click_on "Login"
      expect(page).to have_css('#authenticated-template')
    end

    specify 'during authentication, whitespace is removed from the username to help avoid copy and paste errors' do
      # Confirm we can log into the extension
      login username: "#{test_username}    ", password: test_password
      expect(page).to have_css('#authenticated-template')
    end
  end
end
