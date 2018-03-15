require_relative 'setup'
RSpec.describe 'upgrade chrome page', type: :feature do
  specify 'the page is rendered when the WebRTC API is missing', require_monkeypatch: true  do
    visit popup_path
    jseval("app.chromesettings.webrtc.blockable = false")
    visit popup_path
    expect(page.body).to include(t("UpgradeBrowserMessage", browser: "Chrome"))
    click_on t("CloseText")
  end
end
