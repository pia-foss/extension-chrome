ENV["build"] ||= "webstore"
require 'bundler/setup'
require 'capybara/rspec'
require 'json'
require 'securerandom'
require_relative '../support/spec_mixin'
Bundler.require :default, :test

buildname = ENV["build"]
chrome_binary = ENV["chrome_binary"]
Capybara.register_driver :chrome do |app|
  options = {browser: :chrome, args: ["load-extension=./builds/#{buildname}"]}
  if chrome_binary
    desired_caps = Selenium::WebDriver::Remote::Capabilities.chrome('chromeOptions' => {'binary' => chrome_binary})
    options.merge!(desired_capabilities: desired_caps)
  end
  Capybara::Selenium::Driver.new(app, options)
end

RSpec.configure do |rspec|
  rspec.include SpecMixin, type: :feature
  rspec.include Timeout, type: :feature

  rspec.before :all do
    @__manifest = File.read "./builds/#{buildname}/manifest.json"
    File.write "./builds/#{buildname}/manifest.json", JSON.dump(JSON.parse(@__manifest).tap {|json| json["key"] = File.read('./spec/MANIFEST_KEY').strip })
  end

  rspec.after :all do
    File.write "./builds/#{buildname}/manifest.json", @__manifest
  end

  rspec.before :each do |example|
    Capybara.javascript_driver = :chrome
    Capybara.current_driver    = :chrome
    if example.metadata[:pending] == true
      skip "chromedriver regression"
    end
    if example.metadata[:require_monkeypatch]
      visit popup_path
      if jseval("app.frozen")
        skip "Test wants to monkeypatch 'app' but build was built with frozen objects." \
             "'$ freezeApp=0 rake' to run this test."
      end
    end
  end

  rspec.after :each do
    Capybara.current_session.driver.quit
  end
end
