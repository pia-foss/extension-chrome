import { idescribe, iit, ibeforeEach } from '../core';
import { translate } from '../scripts/translate';
import { AuthFailPage } from '../pages/authfail';
import { cleanHtml } from '../scripts/cleanHtml';
import { expect } from 'chai';
import { RobotsPage } from '../pages/robots';
import { LoginPage } from '../pages/login';
import { setStorage } from '../scripts/setStorage';
import { AuthenticatedPage } from '../pages/authenticated';

idescribe('the page shown on authentication failure', function () {
  let authfailPage: AuthFailPage;
  let robotsPage: RobotsPage;
  let loginPage: LoginPage;
  let authPage: AuthenticatedPage;

  ibeforeEach(async function () {
    // Init
    authfailPage = new AuthFailPage();
    robotsPage = new RobotsPage();
    loginPage = new LoginPage();
    authPage = new AuthenticatedPage();

    // Nav
    await authfailPage.navigate();
  });

  iit('contains a title and message is visible', async function () {
    // Arrange
    const dirtyMessage = await translate(this.script, 'AuthFailMessage');
    const actualMessage = await authfailPage.message.getText();
    const expectedPageTitle = await translate(this.script, 'AuthFailPageTitle');
    const expectedTitle = await translate(this.script, 'AuthFailTitle');

    // Act
    const expectedMessage = await cleanHtml(this.script, dirtyMessage);
    const actualPageTitle = await authfailPage.title.getText();

    // Assert
    expect(actualMessage).to.eq(expectedMessage);
    expect(expectedPageTitle).to.contain(actualPageTitle);
    await this.windows.expectCurrentTitleContains(expectedTitle);
  });

  iit('contains a "support team" button that opens help desk', async function () {
    await authfailPage.support.click();
    await this.windows.expectCurrentUrlIs('https://www.privateinternetaccess.com/helpdesk/');
  });

  iit('is shown when proxy auth fails', async function () {
    await loginPage.navigate();
    await loginPage.signIn();
    await setStorage(this.script, {
      key: 'form:username',
      value: 'blah',
    });
    await authPage.switchOn();
    await robotsPage.navigate();
    await this.windows.expectCurrentUrlIs(authfailPage.getUrl());
  });
});
