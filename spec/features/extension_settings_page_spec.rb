require_relative 'setup'
RSpec.describe 'extension settings page', type: :feature do
  before do
    visit popup_path
    login_successfully
    click_extension_settings_button
  end

  describe 'settings alert' do
    specify 'while disconnected it informs user settings are not in effect' do
      expect(page).to have_content(t("SettingsWarning"))
    end

    specify 'while connected it informs user settings are in effect' do
      click_back_button
      toggle_switch "on"
      click_extension_settings_button
      expect(page).to have_content(t("SettingsWarningConnected", browser: 'Chrome', region: 'US New York City'))
    end
  end

  describe 'setting defaults' do
    specify 'page is rendered with setting defaults being used' do
      ["Security", "Tracking", "Extension"].each{|s| click_setting_section(s)}
      expect(find('input#preventwebrtcleak')).to be_checked
      expect(find('input#blockadobeflash')).to be_checked
      expect(find('input#maceprotection')).to be_checked
      expect(find('input#debugmode')).to_not be_checked
    end
  end

  describe 'uncontrollable settings', require_monkeypatch: true do
    specify 'a warning is shown when a setting is controlled by other extension' do
      jseval("app.chromesettings.hyperlinkaudit.isControllable = () => false")
      jseval("app.chromesettings.hyperlinkaudit.getLevelOfControl = () => 'controlled_by_other_extensions'")
      click_back_button
      click_extension_settings_button
      click_setting_section "Tracking"
      expect(page).to have_content(t("SettingControlledByOther"))
    end

    specify 'a warning is shown when a setting is uncontrollable' do
      jseval("app.chromesettings.hyperlinkaudit.isControllable = () => false")
      jseval("app.chromesettings.hyperlinkaudit.getLevelOfControl = () => 'not_controllable'")
      click_back_button
      click_extension_settings_button
      click_setting_section "Tracking"
      expect(page).to have_content(t("SettingNotControllable"))
    end
  end

  describe 'enable/disable of settings' do
    specify 'checking "Block WebRTC" enables that setting' do
      click_setting_section "Security"
      find('input#preventwebrtcleak').set(false)
      find('input#preventwebrtcleak').set(true)
      expect(block_webrtc_is_enabled).to be(true)
    end

    specify 'unchecking "Block WebRTC" disables that setting' do
      click_setting_section "Security"
      find('input#preventwebrtcleak').set(false)
      expect(block_webrtc_is_enabled).to be(false)
    end

    specify 'checking "Block Adobe Flash" enables that setting' do
      click_setting_section "Security"
      find('input#blockadobeflash').set(false)
      find('input#blockadobeflash').set(true)
      timeout(5) { next while block_adobeflash_is_enabled != true } rescue nil
      expect(block_adobeflash_is_enabled).to be(true)
    end

    specify 'unchecking "Block Adobe Flash" disables that setting' do
      click_setting_section "Security"
      find('input#blockadobeflash').set(false)
      timeout(5) { next while block_adobeflash_is_enabled != false } rescue nil
      expect(block_adobeflash_is_enabled).to be(false)
    end

    specify 'checking "PIA Mace" enables that setting' do
      click_setting_section "Tracking"
      find('input#maceprotection').set(false)
      find('input#maceprotection').set(true)
      expect(mace_is_enabled).to be(true)
    end

    specify 'unchecking the "PIA Mace" disables that setting' do
      click_setting_section "Tracking"
      find('input#maceprotection').set(false)
      expect(mace_is_enabled).to be(false)
    end

    specify 'checking "Debug mode" enables that setting' do
      click_setting_section "Extension"
      find('input#debugmode').set(true)
      expect(debugmode_is_enabled).to be(true)
    end

    specify 'unchecking "Debug mode" disables that setting' do
      click_setting_section "Extension"
      find('input#debugmode').set(true)
      find('input#debugmode').set(false)
      expect(debugmode_is_enabled).to be(false)
    end
  end
end
