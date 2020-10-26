import { PageObject } from '../../core';
import { SectionBase } from './sectionBase';
import { Checkbox, Text } from '../../elements';
import { createSelector } from '../../core/entities/selector';

class TrackingSection extends SectionBase {
  public disableThirdPartyCookies: Checkbox;
  public disableWebsiteReferrer: Checkbox;
  public disableHyperLinkAuditing: Checkbox;
  public hyperLinkAuditMessage: Text;
  public removeUtmParameters: Checkbox;
  public removeFbclidParameters: Checkbox;
  public piaMace: Checkbox;

  constructor(parent: PageObject) {
    super(
      {
        selector: createSelector({
          value: '.section-wrapper.tracking',
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
    this.removeFbclidParameters = new Checkbox(
      {
        selector: createSelector({
          value: '#blockfbclid',
        }),
        name: 'removeFbclidParameters',
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
    this.hyperLinkAuditMessage = new Text(
      {
        selector: createSelector({
          value: '.blockhyperlinkaudit-item .error-line',
        }),
        name: 'hyperlink message',
      },
      this,
    );
  }
}

export { TrackingSection };
