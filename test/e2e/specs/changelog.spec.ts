import { idescribe, iit, ibeforeEach } from '../core';
import { LoginPage } from '../pages/login';
import { SettingsPage } from '../pages/settings';
import { AuthenticatedPage } from '../pages/authenticated';
import { ChangelogPage } from '../pages/changelog';

idescribe('the changelog page', function () {
  let loginPage: LoginPage;
  let settingsPage: SettingsPage;
  let authPage: AuthenticatedPage;
  let changelogPage: ChangelogPage;

  ibeforeEach(async function () {
    loginPage = new LoginPage();
    settingsPage = new SettingsPage();
    authPage = new AuthenticatedPage();
    changelogPage = new ChangelogPage();

    await loginPage.navigate();
    await loginPage.signIn();
    await authPage.menu.toggleDropdown();
    await authPage.menu.settings.click();
    await settingsPage.changelogLink.click();
  });

  iit('can be navigated to by clicking changelog button', async function () {
    await changelogPage.expect.visible;
  });
});
