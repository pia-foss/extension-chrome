require_relative 'setup'
RSpec.describe 'authenticated page', type: :feature do
  before do
    visit popup_path
    login_successfully
  end

  describe 'the on and off switch' do
    specify 'the default state is "off"' do
      expect(find('input.switch')).to_not be_checked
    end

    context 'when its state is changed to "on"' do
      specify 'the status text is changed to "ENABLED"' do
        toggle_switch 'on'
        expect(page).to have_css('.enabled', text: 'ENABLED')
      end

      specify 'the browser tunnels its traffic through a PIA proxy' do
        toggle_switch 'on'
        visit 'https://www.privateinternetaccess.com/api/client/services/https/status'
        resp = JSON.parse page.find("pre").text
        expect(resp).to include("connected" => true)
      end
    end

    context 'when its state is changed to "off"' do
      specify 'the status text is changed to "DISABLED"' do
        toggle_switch 'on'
        toggle_switch 'off'
        expect(page).to have_css('.disabled', text: 'DISABLED')
      end

      specify 'the browser uses a direct connection' do
        toggle_switch 'on'
        toggle_switch 'off'
        visit 'https://www.privateinternetaccess.com/api/client/services/https/status'
        resp = JSON.parse page.find("pre").text
        expect(resp).to include("connected" => false)
      end
    end
  end

  describe 'the current region' do
    specify 'the name of the current region is visible' do
      click_on_current_region
      choose_region_in_list 'brazil'
      expect(page).to have_css('#region .name', text: 'Brazil')
    end
  end

  describe 'when the account settings button is clicked' do
    specify 'the client control panel page is opened in a new tab', pending: true do
      new_tab = window_opened_by { click_account_settings_button }
      page.within_window(new_tab) do
        timeout(5) { next while current_url != 'https://www.privateinternetaccess.com/pages/client-control-panel' } rescue nil
        expect(current_url).to eq('https://www.privateinternetaccess.com/pages/client-control-panel')
      end
    end
  end

  describe 'when the extension settings button is clicked' do
    specify 'the extension settings page is rendered' do
      click_extension_settings_button
      expect(page).to have_css('#settings-template')
    end
  end

  describe 'when the help button is clicked' do
    specify 'the helpdesk page is opened', pending: true do
      new_tab = window_opened_by { click_help_button }
      page.within_window(new_tab) { expect(current_url).to eq("https://helpdesk.privateinternetaccess.com/hc/en-us") }
    end
  end

  describe 'when the logout button is clicked' do
    specify 'the login page is rendered' do
      click_logout_button
      expect(page).to have_css('#login-template')
    end

    specify 'the username and password are removed from storage' do
      click_logout_button
      expect(stored_username).to eq("")
      expect(stored_password).to eq("")
    end
  end
end
