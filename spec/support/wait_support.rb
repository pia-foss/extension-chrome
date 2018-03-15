require 'timeout'
module WaitSupport
  FIND_TIMEOUT = 30
  TIMEOUT = 10
  SLEEP = 0.01
  include Timeout

  def sleep_while(cond)
    timeout(TIMEOUT) do
      sleep SLEEP while cond.call
    end
  end

  def check(*a, &b)
    add_wait!(a)
    super(*a, &b)
  end

  def find(*a, &b)
    add_wait!(a)
    super(*a, &b)
  end

  private

  def add_wait!(a, wait=FIND_TIMEOUT)
    if Hash === a[-1]
      a[-1] = {wait: wait}.merge!(a[-1])
    else
      a.push({wait: wait})
    end
  end
end
