import { createSelector } from '../../core/entities/selector';
import { PageObject } from '../../core';
import { ExtensionSection } from './extension';
import { PrivacySection } from './privacy';
import { TrackingSection } from './tracking';
import { SecuritySection } from './security';
import { SectionBase } from './sectionBase';
import { Text, Button, Link, Select } from '../../elements';

class SettingsPage extends PageObject {
  public static readonly FRENCH = 'language-option-fr';
  public extensionSection: ExtensionSection;
  public privacySection: PrivacySection;
  public trackingSection: TrackingSection;
  public securitySection: SecuritySection;
  public bypassList: Button;
  public changelogLink: Link;
  public back: Button;
  public language: Select;
  public title: Text;

  constructor() {
    super({
      selector: createSelector({
        value: '#settings-page',
      }),
      name: 'settings page',
    });

    this.extensionSection = new ExtensionSection(this);
    this.privacySection = new PrivacySection(this);
    this.trackingSection = new TrackingSection(this);
    this.securitySection = new SecuritySection(this);
    this.language = new Select(
      {
        selector: createSelector({
          value: '.languages',
        }),
        name: 'LanguageSelect',
      },
      this,
      SettingsPage.FRENCH,
    );

    this.bypassList = new Button(
      {
        selector: createSelector({
          value: '.section-wrapper.bypass',
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

  public async changeLanguage() {
    await this.language.selectOption(SettingsPage.FRENCH);
  }

  public getSections() {
    return [
      this.extensionSection,
      this.privacySection,
      this.trackingSection,
      this.securitySection,
    ];
  }

  public getSection(sectionName: string): SectionBase {
    const section = (this as any)[`${sectionName}Section`];
    if (!section) {
      throw new Error(`no such section with name: ${sectionName}`);
    }
    return section;
  }

  public async expandAll() {
    const sections = this.getSections();
    // Must use for loop (can't perform concurrently)
    for (const section of sections) {
      await section.expand();
    }
  }
}

export { SettingsPage };
