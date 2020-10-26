import { idescribe, iit, ibeforeEach } from '../core';
import { AuthenticatedPage } from '../pages/authenticated';
import { SettingsPage } from '../pages/settings';
import { LoginPage } from '../pages/login';
import { waitForRules } from '../scripts/waitForRules';

interface Site {
  http: string;
  https: string;
}

idescribe('https upgrade', function () {
  let authPage: AuthenticatedPage;
  let settingsPage: SettingsPage;
  let loginPage: LoginPage;

  const sites: ReadonlyArray<Site> = Object.freeze([
    {
      http: 'http://netbsd.org/',
      https: 'https://netbsd.org/',
    },
  ]);

  ibeforeEach(async function () {
    authPage = new AuthenticatedPage();
    settingsPage = new SettingsPage();
    loginPage = new LoginPage();

    await loginPage.navigate();
    await loginPage.signIn();
    await waitForRules(this.script);
    await authPage.menu.toggleDropdown();
    await authPage.menu.settings.click();
    await settingsPage.securitySection.expand();
  });

  idescribe('setting off', function () {
    ibeforeEach(async function () {
      await settingsPage.securitySection.httpsUpgrade.uncheck();
      await settingsPage.back.click();
      await authPage.switchOn();
    });

    sites.forEach((site) => {
      iit(`should not upgrade ${site.http}`, async function () {
        // act
        await this.windows.open(site.http);

        // assert
        await this.windows.expectCurrentUrlIs(site.http);
      });
    });
  });

  idescribe('setting on', function () {
    ibeforeEach(async function () {
      await settingsPage.securitySection.httpsUpgrade.check();
      await settingsPage.back.click();
      await authPage.switchOn();
    });

    sites.forEach((site) => {
      iit(`should upgrade ${site.http} to ${site.https}`, async function () {
        // act
        await this.windows.open(site.http);

        // assert
        await this.windows.expectCurrentUrlIs(site.https);
      });
    });
  });
});
