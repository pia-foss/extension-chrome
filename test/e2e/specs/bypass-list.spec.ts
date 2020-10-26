import { idescribe, iit, ibeforeEach } from '../core';
import { LoginPage } from '../pages/login';
import { SettingsPage } from '../pages/settings';
import { AuthenticatedPage } from '../pages/authenticated';
import { BypassPage } from '../pages/bypass';
import { getEnabledPopularRules } from '../scripts/getEnabledPopularRules';
import { expect } from 'chai';
import { getConnected } from '../scripts/getConnected';

idescribe('the bypass list page', function () {
  let loginPage: LoginPage;
  let settingsPage: SettingsPage;
  let authPage: AuthenticatedPage;
  let bypassPage: BypassPage;

  ibeforeEach(async function () {
    loginPage = new LoginPage();
    settingsPage = new SettingsPage();
    authPage = new AuthenticatedPage();
    bypassPage = new BypassPage();

    await loginPage.navigate();
    await loginPage.signIn();
    await authPage.waitForLatencyTest();
    await authPage.switchOn();
    await authPage.menu.toggleDropdown();
    await authPage.menu.settings.click();
    await settingsPage.bypassList.click();
  });

  idescribe('popular rules', function () {
    iit('lets you add netflix', async function () {
      await bypassPage.popularNetflix.check();
      const actualRules = await getEnabledPopularRules(this.script);
      expect(actualRules).to.have.lengthOf(1);
      expect(actualRules).contain('netflix');
    });

    iit('lets you add hulu', async function () {
      await bypassPage.popularHulu.check();
      const actualRules = await getEnabledPopularRules(this.script);
      expect(actualRules).to.have.lengthOf(1);
      expect(actualRules).contain('hulu');
    });
  });

  idescribe('user rules', function () {
    iit('input has placeholder', async function () {
      await bypassPage.addBar.hasPlaceholder('*.privateinternetaccess.com');
    });

    iit('bypasses a user rule', async function () {
      await bypassPage.addBar.setValue('https://www.privateinternetaccess.com');
      await bypassPage.addButton.click();
      const connected = await getConnected(this.script);
      expect(connected).to.be.false;
    });

    iit('does not bypass a different top-level domain', async function () {
      await bypassPage.addBar.setValue('https://www.privateinternetaccess.co.uk');
      await bypassPage.addButton.click();
      const connected = await getConnected(this.script);
      expect(connected).to.be.true;
    });
  });
});
