import { PageObject } from '../../core';
import { createSelector } from '../../core/entities/selector';
import { Text } from '../../elements';

class LeakCheckPage extends PageObject {
  public rtcLocal: Text;
  public rtcIpv4: Text;
  public rtcIpv6: Text;

  constructor() {
    super({
      selector: createSelector({
        value: '#content',
      }),
      name: 'leak check page',
    });
    this.rtcLocal = new Text(
      {
        selector: createSelector({
          value: '#rtc-local',
        }),
        name: 'rtcLocal',
      },
      this,
    );
    this.rtcIpv4 = new Text(
      {
        selector: createSelector({
          value: '#rtc-ipv4',
        }),
        name: 'rtcIpv4',
      },
      this,
    );
    this.rtcIpv6 = new Text(
      {
        selector: createSelector({
          value: '#rtc-ipv6',
        }),
        name: 'rtcIpv6',
      },
      this,
    );

    // Override URL
    this.url = 'https://browserleaks.com/webrtc';
  }
}

export { LeakCheckPage };
