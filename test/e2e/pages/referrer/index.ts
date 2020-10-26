import { PageObject } from '../../core';
import { createSelector } from '../../core/entities/selector';
import { Text } from '../../elements';

enum Frame {
  REFERRER = 'noreferrer_iframe',
  NO_REFERRER = 'referrer_iframe',
  POST_FORM = 'referrer_post_form',
  GET_FORM = 'referrer_get_form',
}

class ReferrerPage extends PageObject {
  constructor() {
    super({
      selector: createSelector({
        value: '#darklaunch',
      }),
      name: 'referrer test page',
    });
    // override url
    this.url = 'https://www.darklaunch.com/tools/test-referer';
  }

  public async switchToReferrerFrame(frame: Frame) {
    const switchFromFrame = await super.switchToFrame(frame);
    const status = new Text({
      selector: createSelector({
        value: '.response',
      }),
      name: 'status',
    });

    return { status, switchFromFrame };
  }
}

export { ReferrerPage, Frame };
