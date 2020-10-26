import { Button } from '../../elements';

class ProxySwitch extends Button {
  waitForConnected() {
    return this.waitForHasClass('connected');
  }
}

export { ProxySwitch };
