import { expect } from 'chai';

import { idescribe, iit, ibeforeEach } from '../core';
import { LoginPage } from '../pages/login';
import { BrowserUpgradePage } from '../pages/upgrade';
import { blockWebRTC } from '../scripts/blockWebRTC';
import { translate } from '../scripts/translate';

idescribe('the upgrade chrome page', function () {
  let loginPage: LoginPage;
  let upgradePage: BrowserUpgradePage;

  ibeforeEach(async function () {
    loginPage = new LoginPage();
    upgradePage = new BrowserUpgradePage();

    await loginPage.navigate();
    await blockWebRTC(this.script);
    await this.windows.refresh({ waitForVisible: upgradePage.warningIcon });
  });

  iit('is shown when WebRTC API missing', async function () {
    const expectedText = await translate(
      this.script,
      'UpgradeBrowserMessage',
      { browser: 'Chrome' },
    );
    await upgradePage.warningIcon.expect.visible;
    await upgradePage.warningText.expect.visible;
    const actualText = await upgradePage.warningText.getText();
    expect(actualText).to.eq(expectedText);
  });
});
