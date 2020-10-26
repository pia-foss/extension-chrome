import { idescribe, iit } from '../core';
import { createData } from '../data/settings.data';
import { SettingsPage } from '../pages/settings';
import { LoginPage } from '../pages/login';
import { AuthenticatedPage } from '../pages/authenticated';
import { Checkbox } from '../elements';
import { SectionBase } from '../pages/settings/sectionBase';
import { getStorage } from '../scripts/getStorage';
import { setLevelOfControl } from '../scripts/setLevelOfControl';
import { expect } from 'chai';

idescribe('the settings page', function () {
  let settingsPage: SettingsPage;
  let loginPage: LoginPage;
  let authPage: AuthenticatedPage;

  beforeEach(async function () {
    // Init
    settingsPage = new SettingsPage();
    loginPage = new LoginPage();
    authPage = new AuthenticatedPage();

    // Nav
    await loginPage.navigate();
    await loginPage.signIn();
    await authPage.menu.toggleDropdown();
    await authPage.menu.settings.click();
  });

  idescribe('when proxy disconnected', function () {
    iit('shows a warning when a setting is uncontrollable', async function () {
      const expectedText = 'The extension cannot control this setting.';
      settingsPage.back.click();
      await setLevelOfControl(this.script, {
        levelOfControl: 'not_controllable',
        settingID: 'hyperlinkaudit',
      });
      await authPage.menu.toggleDropdown();
      await authPage.menu.settings.click();
      const { trackingSection } = settingsPage;
      await trackingSection.expand();
      await trackingSection.disableHyperLinkAuditing.expectNotChecked();
      await trackingSection.disableHyperLinkAuditing.toggle();
      await trackingSection.disableHyperLinkAuditing.expectNotChecked();
      await trackingSection.hyperLinkAuditMessage.expect.exists;
      const text = await trackingSection.hyperLinkAuditMessage.getText();
      expect(text).to.eq(expectedText);
    });

    createData().map((settingData) => {
      idescribe(`"${settingData.settingName}" setting`, function () {
        let checkbox: Checkbox;
        let section: SectionBase;

        beforeEach(async function () {
          section = (settingsPage as any)[`${settingData.sectionName}Section`];
          checkbox = (section as any)[settingData.settingName];
        });

        iit(`is ${settingData.expectedDefault} by default`, async function () {
          // Don't need to expand section, not interacting w/ setting
          const { expectedDefault } = settingData;
          if (expectedDefault) {
            await checkbox.expectChecked();
          }
          else {
            await checkbox.expectNotChecked();
          }
        });

        iit('can be enabled by checking the checkbox', async function () {
          await section.expand();
          await checkbox.toggle();
          await checkbox.check();

          const storageValue = await getStorage(this.script, `settings:${settingData.settingID}`);
          expect(storageValue).to.eq(true);
          await checkbox.expectChecked();
        });

        iit('can be disabled by checking the checkbox', async function () {
          await section.expand();
          await checkbox.toggle();
          await checkbox.uncheck();

          const storageValue = await getStorage(this.script, `settings:${settingData.settingID}`);
          expect(storageValue).to.eq(false);
          await checkbox.expectNotChecked();
        });
      });
    });
  });
});
