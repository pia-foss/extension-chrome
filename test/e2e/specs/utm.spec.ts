import { idescribe, iit, ibeforeEach } from '../core';
import { LoginPage } from '../pages/login';
import { AuthenticatedPage } from '../pages/authenticated';
import { createPiaUrl } from '../helpers/url';

idescribe('the UTM parameters setting', function () {
  let loginPage: LoginPage;
  let authPage: AuthenticatedPage;
  let target: string;
  let cleaned: string;

  ibeforeEach(async function () {
    // Init
    loginPage = new LoginPage();
    authPage = new AuthenticatedPage();
    const nonUtmParam = { name: 'randomkey', value: 'randomvalue' };
    target = createPiaUrl('robots.txt', [
      { name: 'utm_source', value: 'testsuite' },
      { name: 'utm_medium', value: 'capybara' },
      nonUtmParam,
    ]);
    cleaned = createPiaUrl('robots.txt', [
      nonUtmParam,
    ]);

    await loginPage.navigate();
    await loginPage.signIn();
  });

  idescribe('when active', function () {
    ibeforeEach(async function () {
      await authPage.switchOn();
      await this.windows.open(target);
    });

    iit('removes UTM parameters from Urls, not other parameters', async function () {
      await this.windows.expectCurrentUrlIs(cleaned);
    });
  });

  idescribe('when not active', function () {
    ibeforeEach(async function () {
      await this.windows.open(target);
    });

    iit('does not remove UTM parameters from URL', async function () {
      await this.windows.expectCurrentUrlIs(target);
    });
  });
});
