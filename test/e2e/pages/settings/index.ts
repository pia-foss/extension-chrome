import { createSelector } from '../../core/entities/selector';
import { PageObject } from '../../core';
import { ExtensionSection } from './extension';
import { PrivacySection } from './privacy';
import { TrackingSection } from './tracking';
import { SecuritySection } from './security';
import { Text, Button, Link, Dropdown } from '../../elements';

class SettingsPage extends PageObject {
  public static readonly FRENCH = 'language-option-fr';
  public extensionSection: ExtensionSection;
  public privacySection: PrivacySection;
  public trackingSection: TrackingSection;
  public securitySection: SecuritySection;
  public bypassList: Button;
  public changelogLink: Link;
  public connectedWarning: Text;
  public disconnectedWarning: Text;
  public back: Button;
  public language: Dropdown;
  public title: Text;

  constructor() {
    super({
      selector: createSelector({
        value: '#settings-template',
      }),
      name: 'settings page',
    });

    this.extensionSection = new ExtensionSection(this);
    this.privacySection = new PrivacySection(this);
    this.trackingSection = new TrackingSection(this);
    this.securitySection = new SecuritySection(this);
    this.language = new Dropdown(
      {
        selector: createSelector({
          value: '#languages',
        }),
        name: 'LanguageDropdown',
      },
      this,
      SettingsPage.FRENCH,
    );

    this.bypassList = new Button(
      {
        selector: createSelector({
          value: '.sectionwrapper.bypass',
        }),
        name: 'bypassList',
      },
      this,
    );
    this.changelogLink = new Link(
      {
        selector: createSelector({
          value: '.panelfooter a',
        }),
        name: 'changelogLink',
      },
      this,
    );
    this.connectedWarning = new Text(
      {
        selector: createSelector({
          value: '.settingswarning-connected',
        }),
        name: 'connectedWarning',
      },
      this,
    );
    this.disconnectedWarning = new Text(
      {
        selector: createSelector({
          value: '.settingswarning-disconnected',
        }),
        name: 'disconnectedWarning',
      },
      this,
    );
    this.back = new Button(
      {
        selector: createSelector({
          value: '.back-icon',
        }),
        name: 'back button',
      },
      this,
    );
    this.title = new Text(
      {
        selector: createSelector({
          value: '.header .text',
        }),
        name: 'Title',
      },
      this,
    );
  }

  async changeLanguage() {
    await this.language.selectOption(SettingsPage.FRENCH);
  }
}

export { SettingsPage };
