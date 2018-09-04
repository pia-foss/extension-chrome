import { PageObject } from '../../core';
import { SectionBase } from './sectionBase';
import { Checkbox } from '../../elements';
import { createSelector } from '../../core/entities/selector';

class SecuritySection extends SectionBase {
  public blockAdobeFlashCheckbox: Checkbox;
  public preventWebRtcLeak: Checkbox;
  constructor(parent: PageObject) {
    super(
      {
        selector: createSelector({
          value: '.sectionwrapper.security',
        }),
        name: 'security settings',
      },
      parent,
    );
    this.blockAdobeFlashCheckbox = new Checkbox(
      {
        selector: createSelector({
          value: '#blockadobeflash',
        }),
        name: 'blockAdobeFlashCheckbox',
      },
      this,
    );
    this.preventWebRtcLeak = new Checkbox(
      {
        selector: createSelector({
          value: '#preventwebrtcleak',
        }),
        name: 'preventWebRtcLeak',
      },
      this,
    );
  }
}

export { SecuritySection };
