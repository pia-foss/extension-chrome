namespace :spec do
  desc "Run feature specs"
  task :features do
    buildname = ENV["build"] || "webstore"
    sh "freezeApp=0 build=#{buildname} browser=chrome grunt"
    sh "build=#{buildname} bundle exec rspec --tag @require_monkeypatch spec/"
    sh "freezeApp=1 build=#{buildname} browser=chrome grunt"
    sh "build=#{buildname} bundle exec rspec --tag ~@require_monkeypatch spec/"
  end
end
task default: "spec:features"
