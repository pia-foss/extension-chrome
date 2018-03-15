require_relative 'setup'
RSpec.describe 'WebRTC', type: :feature do
  before do
    visit popup_path
    login_successfully
  end

  describe 'Block WebRTC IP detection' do
    specify 'when enabled public, private, and IPv6 address are not detected' do
      toggle_switch 'on'
      visit 'https://browserleaks.com/webrtc'
      expect(page).to have_selector("#rtc_local", text: "n/a")
      expect(page).to have_selector("#rtc_ipv4", text: "n/a")
      expect(page).to have_selector("#rtc_ipv6", text: "n/a")
    end

    specify 'when disabled at least a public IP address is detected' do
      visit 'https://browserleaks.com/webrtc'
      expect(page).to have_selector("#rtc_ipv4", text: /\d+/)
    end
  end
end
