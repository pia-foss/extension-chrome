import { PageObject } from '../../core';
import { SectionBase } from './sectionBase';
import { Checkbox } from '../../elements';
import { createSelector } from '../../core/entities/selector';

class PrivacySection extends SectionBase {
  public blockCamera: Checkbox;
  public blockMicrophone: Checkbox;
  public blockLocation: Checkbox;
  public disableNetworkPrediction: Checkbox;
  public disableSafeBrowsing: Checkbox;
  public disableAutofillCreditCard: Checkbox;
  public disableAutofillAddress: Checkbox;

  constructor(parent: PageObject) {
    super(
      {
        selector: createSelector({
          value: '.section-wrapper.privacy',
        }),
        name: 'privacy settings',
      },
      parent,
    );
    this.blockCamera = new Checkbox(
      {
        selector: createSelector({
          value: '#blockcamera',
        }),
        name: 'blockCamera',
      },
      this,
    );
    this.blockMicrophone = new Checkbox(
      {
        selector: createSelector({
          value: '#blockmicrophone',
        }),
        name: 'blockMicrophone',
      },
      this,
    );
    this.blockLocation = new Checkbox(
      {
        selector: createSelector({
          value: '#blocklocation',
        }),
        name: 'blockLocation',
      },
      this,
    );
    this.disableNetworkPrediction = new Checkbox(
      {
        selector: createSelector({
          value: '#blocknetworkprediction',
        }),
        name: 'disableNetworkPrediction',
      },
      this,
    );
    this.disableSafeBrowsing = new Checkbox(
      {
        selector: createSelector({
          value: '#blocksafebrowsing',
        }),
        name: 'disableSafeBrowsing',
      },
      this,
    );
    this.disableAutofillCreditCard = new Checkbox(
      {
        selector: createSelector({
          value: '#blockautofillcreditcard',
        }),
        name: 'disableAutofillCreditCard',
      },
      this,
    );
    this.disableAutofillAddress = new Checkbox(
      {
        selector: createSelector({
          value: '#blockautofilladdress',
        }),
        name: 'disableAutofillAddress',
      },
      this,
    );
  }
}

export { PrivacySection };
