# coding: utf-8
require_relative 'setup'
RSpec.describe "Language settings", type: :feature do
  shared_examples "language dropdown" do |language, locale, domain|
    it "changes language to #{language} (#{locale})" do
      lkeys = %w(SettingsWarning Security Privacy Tracking Extension ProxyBypassList enabled
                 NoRulesAdded UILanguage DebugMode AllowExtensionNotifications)
      click_setting_section t("Extension")
      select language, from: t("UILanguage")
      expect(page).to have_content(t("ChangeExtensionSettings", nil, locale).upcase)
      lkeys.each {|m| expect(page).to have_content(t(m, nil, locale)) }
    end

    it "changes language used on authfail.html to #{language}" do
      lkeys = %w(AuthFailTitle AuthFailMessage)
      click_setting_section t("Extension")
      select language, from: t("UILanguage")
      visit authfail_path
      expect(page.title).to eq(t("AuthFailPageTitle", nil, locale))
      lkeys.each{|k| expect(page.body.gsub(/<.*?>/, '')).to include(t(k, nil, locale).gsub(/<.*?>/, '')) }
    end

    it "changes language used on connfail.html to #{language}" do
      lkeys = %w(ConnectionFailTitle ConnectionFailMessage TryAgain)
      id = jseval("app.util.errorinfo.set('net::SOME_ERROR', 'https://www.foo.com')")
      click_setting_section t("Extension")
      select language, from: t("UILanguage")
      visit connfail_path(id)
      expect(page.title).to eq(t("ConnectionFailPageTitle", nil, locale))
      lkeys.each{|k| expect(page.body).to include(t(k, nil, locale)) }
    end

    it "changes domain used to open the client control panel to #{domain}", pending: true do
      click_setting_section t("Extension")
      select language, from: t("UILanguage")
      click_back_button
      new_tab = window_opened_by { click_account_settings_button }
      within_window(new_tab) do
        expect(current_url).to eq("#{domain}/pages/client-control-panel")
      end
    end

    it "stores locale #{locale} in storage" do
      click_setting_section t("Extension")
      select language, from: t("UILanguage")
      expect(jseval("app.util.storage.getItem('locale')")).to eq(locale)
    end
  end

  describe 'Language dropdown' do
    before do
      visit popup_path
      login_successfully
      click_extension_settings_button
    end

    include_examples "language dropdown", "Русский", "ru", "https://rus.privateinternetaccess.com"
    include_examples "language dropdown", "繁體中文", "zh_TW", "https://cht.privateinternetaccess.com"
    include_examples "language dropdown", "简体中文", "zh_CN", "https://chi.privateinternetaccess.com"
  end
end
