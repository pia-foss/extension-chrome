require 'dotenv/load'
require_relative 'locale_support'
require_relative 'wait_support'

module SpecMixin
  include LocaleSupport
  include WaitSupport

  def test_username
    ENV['TEST_USERNAME']
  end

  def test_password
    ENV['TEST_PASSWORD']
  end

  def stored_username
    jseval('app.util.user.username()')
  end

  def stored_password
    jseval('app.util.user.password()')
  end

  def inmemory_username
    jseval('app.util.storage.getItem("form:username", "memoryStorage")')
  end

  def inmemory_password
    jseval('app.util.storage.getItem("form:password", "memoryStorage")')
  end

  def localstorage_username
    jseval('app.util.storage.getItem("form:username", "localStorage")')
  end

  def localstorage_password
    jseval('app.util.storage.getItem("form:password", "localStorage")')
  end

  def block_webrtc_is_enabled
    jseval('app.util.settings.getItem("preventwebrtcleak")')
  end

  def block_adobeflash_is_enabled
    jseval('app.util.settings.getItem("blockadobeflash")')
  end

  def mace_is_enabled
    jseval('app.util.settings.getItem("maceprotection")')
  end

  def debugmode_is_enabled
    jseval('app.util.settings.getItem("debugmode")')
  end

  def connect!
    jseval("app.proxy.enable(app.util.regionlist.getSelectedRegion())")
  end

  def jseval(script)
    f = <<-F
    (function() {
      var app = chrome.extension.getBackgroundPage().app;
      return #{script};
    }())
    F
    page.evaluate_script(f)
  end

  def login(username:, password:)
    fill_in_username username
    fill_in_password password
    click_on 'Login'
  end

  def fill_in_username(username)
    find('input[name="form:username"]').set username
  end

  def fill_in_password(password)
    find('input[name="form:password"]').set password
  end

  def fill_in_bypass_list(str)
    find('input[name="rule"]').set str
  end

  def click_setting_section(section)
    all(".settingheader").each do |e|
      text = e.find("span.sectiontitle").text
      if text.strip == section
        e.click
        break
      end
    end
  end

  def click_save_bypass_list
    find('input.add-btn').click
  end

  def click_back_button
    find('.back-icon').click
  end

  def click_on_current_region
    find('#region').click
  end

  def click_list_view_icon
    find('#list-icon').click
  end

  def click_grid_view_icon
    find('#grid-icon').click
  end

  def choose_region_in_grid(region_id)
    find("div[data-region-id='#{region_id}']").click
  end

  def choose_region_in_list(region_id)
    find("a[data-region-id='#{region_id}'").click
  end

  def login_successfully
    login username: test_username, password: test_password
  end

  def toggle_switch(state)
    find('input.switch').set state == 'on'
  end

  def click_account_settings_button
    find('.btn-account').click
  end

  def click_extension_settings_button
    find('.settings-icon').click
  end

  def click_help_button
    find('.btn-help').click
  end

  def click_logout_button
    find('.btn-logout').click
  end

  def extension_id
    ENV['EXTENSION_ID']
  end

  def popup_path
    "chrome-extension://#{extension_id}/html/foreground.html"
  end

  def authfail_path
    "chrome-extension://#{extension_id}/html/errorpages/authfail.html"
  end

  def connfail_path(id)
    "chrome-extension://#{extension_id}/html/errorpages/connfail.html?id=#{id}"
  end
end
