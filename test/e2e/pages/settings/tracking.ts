import { PageObject } from '../../core';
import { SectionBase } from './sectionBase';
import { Checkbox } from '../../elements';
import { createSelector } from '../../core/entities/selector';

class TrackingSection extends SectionBase {
  public disableThirdPartyCookies: Checkbox;
  public disableWebsiteReferrer: Checkbox;
  public disableHyperLinkAuditing: Checkbox;
  public removeUtmParameters: Checkbox;
  public piaMace: Checkbox;

  constructor(parent: PageObject) {
    super(
      {
        selector: createSelector({
          value: '.sectionwrapper.tracking',
        }),
        name: 'tracking settings',
      },
      parent,
    );
    this.disableThirdPartyCookies = new Checkbox(
      {
        selector: createSelector({
          value: '#blockthirdpartycookies',
        }),
        name: 'disableThirdPartyCookies',
      },
      this,
    );
    this.disableWebsiteReferrer = new Checkbox(
      {
        selector: createSelector({
          value: '#blockreferer',
        }),
        name: 'disableWebsiteReferrer',
      },
      this,
    );
    this.disableHyperLinkAuditing = new Checkbox(
      {
        selector: createSelector({
          value: '#blockhyperlinkaudit',
        }),
        name: 'disableHyperLinkAuditing',
      },
      this,
    );
    this.removeUtmParameters = new Checkbox(
      {
        selector: createSelector({
          value: '#blockutm',
        }),
        name: 'removeUtmParameters',
      },
      this,
    );
    this.piaMace = new Checkbox(
      {
        selector: createSelector({
          value: '#maceprotection',
        }),
        name: 'piaMace',
      },
      this,
    );
  }
}

export { TrackingSection };
