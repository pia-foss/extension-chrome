import { expect } from 'chai';

import { idescribe, iit, ibeforeEach } from '../core';
import { LoginPage } from '../pages/login';
import { ConnFailPage } from '../pages/connfail';
import { AuthenticatedPage } from '../pages/authenticated';
import { failConnection } from '../scripts/failConnection';
import { translate } from '../scripts/translate';
import { RobotsPage } from '../pages/robots';

idescribe('the connection failed page', function () {
  let robotsPage: RobotsPage;
  let loginPage: LoginPage;
  let connFailPage: ConnFailPage;
  let authPage: AuthenticatedPage;

  ibeforeEach(async function () {
    authPage = new AuthenticatedPage();
    loginPage = new LoginPage();
    connFailPage = new ConnFailPage();
    robotsPage = new RobotsPage();
    await loginPage.navigate();
    await loginPage.signIn();
    await authPage.waitForLatencyTest();
    await authPage.switchOn();
    const id = await failConnection(this.script);
    await connFailPage.navigate((url) => {
      return `${url}?id=${id}`;
    });
  });

  iit('refreshing the page brings you to the URL where the connection failed', async function () {
    await this.windows.refresh({ waitForVisible: robotsPage.container });
    await this.windows.expectCurrentUrlIs(robotsPage.getUrl());
  });

  iit('contains title', async function () {
    const expectedTitle = await translate(this.script, 'ConnectionFailTitle');
    const actualTitle = await connFailPage.title.getText();
    expect(actualTitle).to.eq(expectedTitle);
  });

  iit('contains message', async function () {
    const expectedMessage = await translate(this.script, 'ConnectionFailMessage');
    const actualMessage = await connFailPage.message.getText();
    expect(actualMessage).to.eq(expectedMessage);
  });

  iit('contains error', async function () {
    const expectedError = 'net::ERR_CONNECTION_RESET';
    const actualMessage = await connFailPage.error.getText();
    expect(actualMessage).to.eq(expectedError);
  });

  iit('has correct page title', async function () {
    const expectedTitle = await translate(this.script, 'ConnectionFailPageTitle');
    await this.windows.expectCurrentTitleIs(expectedTitle);
  });

  idescribe('try again button', function () {
    iit('is visible', async function () {
      await connFailPage.tryAgainButton.expect.visible;
    });

    iit('has correct label', async function () {
      const expectedLabel = await translate(this.script, 'TryAgain');
      const actualLabel = await connFailPage.tryAgainButton.getLabel();
      expect(actualLabel).to.eq(expectedLabel.toUpperCase());
    });

    iit('will open the page where connection failed if clicked', async function () {
      await connFailPage.tryAgainButton.click();
      await this.windows.expectCurrentUrlIs(robotsPage.getUrl());
    });
  });
});
