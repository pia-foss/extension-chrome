require_relative 'setup'
RSpec.describe "Bypass List", type: :feature do
  let(:input_placeholder) do
    'Add URL to bypass list'
  end

  before do
    visit popup_path
    login_successfully
    click_extension_settings_button
    click_setting_section t("ProxyBypassList")
  end


  specify 'has placeholder' do
    expect(page).to have_selector("input[placeholder='#{input_placeholder}']")
  end

  specify 'add netflix as enabled popular rule' do
    check "netflix"
    expect(jseval('app.util.bypasslist.enabledPopularRules()')).to eq(["netflix"])
  end

  specify 'add Hulu as enabled popular rule' do
    check "hulu"
    expect(jseval('app.util.bypasslist.enabledPopularRules()')).to eq(["hulu"])
  end

  specify "bypasses https://www.privateinternetaccess.com" do
    connect!
    fill_in_bypass_list "https://www.privateinternetaccess.com"
    click_save_bypass_list
    visit "https://www.privateinternetaccess.com/api/client/services/https/status"
    resp = JSON.parse page.find("pre").text
    expect(resp).to include("connected" => false)
  end

  specify "does not bypass https://www.privateinternetaccess.com" do
    connect!
    fill_in_bypass_list "https://www.privateinternetaccess.co.uk"
    click_save_bypass_list
    visit "https://www.privateinternetaccess.com/api/client/services/https/status"
    resp = JSON.parse page.find("pre").text
    expect(resp).to include("connected" => true)
  end
end
