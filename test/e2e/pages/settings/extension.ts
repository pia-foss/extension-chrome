import { PageObject } from '../../core';
import { SectionBase } from './sectionBase';
import { Checkbox } from '../../elements';
import { createSelector } from '../../core/entities/selector';

class ExtensionSection extends SectionBase {
  public allowDesktopNotifications: Checkbox;
  public logoutOnClose: Checkbox;
  public debugMode: Checkbox;
  public viewDebugLog: Checkbox;
  public uiLanguages: Checkbox;

  constructor(parent: PageObject) {
    super(
      {
        selector: createSelector({
          value: '.sectionwrapper.developer',
        }),
        name: 'extension settings',
      },
      parent,
    );
    this.allowDesktopNotifications = new Checkbox(
      {
        selector: createSelector({
          value: '#allowExtensionNotifications',
        }),
        name: 'allowDesktopNotifications',
      },
      this,
    );
    this.logoutOnClose = new Checkbox(
      {
        selector: createSelector({
          value: '#logoutOnClose',
        }),
        name: 'logoutOnClose',
      },
      this,
    );
    this.debugMode = new Checkbox(
      {
        selector: createSelector({
          value: '#debugmode',
        }),
        name: 'debugMode',
      },
      this,
    );
    this.viewDebugLog = new Checkbox(
      {
        selector: createSelector({
          value: '.dlviewbtn > button',
        }),
        name: 'viewDebugLog',
      },
      this,
    );
    this.uiLanguages = new Checkbox(
      {
        selector: createSelector({
          value: '#languages',
        }),
        name: 'uiLanguages',
      },
      this,
    );
  }
}

export { ExtensionSection };
