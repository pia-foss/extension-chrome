require_relative 'setup'

RSpec.describe 'Remove UTM parameters', type: :feature do
  before do
    visit popup_path
    login_successfully
  end

  let(:target) do
    'https://www.privateinternetaccess.com/robots.txt?utm_source=testsuite&utm_medium=capybara'
  end

  specify 'when enabled UTM parameters are removed from URL' do
    toggle_switch 'on'
    visit target
    expect(current_url).to eq(target[/[^?]+/])
  end

  specify "when enabled UTM parameters are removed from URL, and other parameters are kept" do
    target << "&foo=1"
    toggle_switch 'on'
    visit target
    expect(current_url).to eq(target[/[^?]+/] << "?foo=1")
  end

  specify 'when disabled UTM query parameters are not removed from URL' do
    visit target
    expect(current_url).to eq(target)
  end
end
