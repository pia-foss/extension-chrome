import { idescribe, iit } from '../core';
import { createData } from '../data/settings.data';
import { SettingsPage } from '../pages/settings';
import { LoginPage } from '../pages/login';
import { AuthenticatedPage } from '../pages/authenticated';
import { Checkbox } from '../elements';
import { SectionBase } from '../pages/settings/sectionBase';
import { getStorage } from '../scripts/getStorage';
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
    await authPage.menu.settings.click();
  });

  idescribe('when proxy connected', function () {
    beforeEach(async function () {
      await settingsPage.back.click();
      await authPage.switchOn();
      await authPage.menu.settings.click();
    });
    iit('informs user the settings are in effect', async function () {
      await settingsPage.connectedWarning.expect.visible;
      await settingsPage.disconnectedWarning.expect.not.visible;
    });
  });

  idescribe('when proxy disconnected', function () {
    iit('warns user the settings aren\'t in effect', async function () {
      await settingsPage.disconnectedWarning.expect.visible;
      await settingsPage.connectedWarning.expect.not.visible;
    });

    iit('shows a warning when a setting is uncontrollable');

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
          expect(storageValue).to.eq('true');
          await checkbox.expectChecked();
        });

        iit('can be disabled by checking the checkbox', async function () {
          await section.expand();
          await checkbox.toggle();
          await checkbox.uncheck();

          const storageValue = await getStorage(this.script, `settings:${settingData.settingID}`);
          expect(storageValue).to.eq('false');
          await checkbox.expectNotChecked();
        });
      });
    });
  });
});
