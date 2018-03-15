module LocaleSupport
  T_TABLE = {}
  Dir[File.join(Dir.getwd, 'builds', ENV['build'], '_locales', '*')].each do |path|
    l = File.basename(path)
    j = JSON.parse File.read(File.join(path, "messages.json"))
    T_TABLE[l] = Hash[j.map{|k,v| [k,v['message']]}]
  end

  def t(key, variables={}, locale="en")
    T_TABLE[locale][key].tap do |m|
      (variables || {}).each {|name, value| m.gsub!("%{#{name}}", value)}
    end
  end
end
