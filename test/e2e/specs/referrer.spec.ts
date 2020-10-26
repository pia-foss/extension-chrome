import { expect } from 'chai';

import { LoginPage } from '../pages/login';
import { AuthenticatedPage } from '../pages/authenticated';
import { ReferrerPage, Frame } from '../pages/referrer';
import { SettingsPage } from '../pages/settings';
import { idescribe, iit, ibeforeEach } from '../core';

idescribe('http referrer', function () {
  let loginPage: LoginPage;
  let authenticatedPage: AuthenticatedPage;
  let settingsPage: SettingsPage;
  let referrerPage: ReferrerPage;
  let strippedText: string;

  ibeforeEach(async function () {
    loginPage = new LoginPage();
    authenticatedPage = new AuthenticatedPage();
    settingsPage = new SettingsPage();
    referrerPage = new ReferrerPage();
    strippedText = 'no referrer was sent!';

    await loginPage.navigate();
    await loginPage.signIn();
    await authenticatedPage.waitForLatencyTest();
    await authenticatedPage.switchOn();
  });

  idescribe('setting turned off', async function () {
    ibeforeEach(async function () {
      const { trackingSection } = settingsPage;
      await authenticatedPage.menu.toggleDropdown();
      await authenticatedPage.menu.settings.click();
      await trackingSection.expand();
      await trackingSection.disableWebsiteReferrer.uncheck();
    });

    iit('should not strip referrer', async function () {
      await assertReferrers(false);
    });
  });

  idescribe('setting turned on', async function () {
    ibeforeEach(async function () {
      const { trackingSection } = settingsPage;
      await authenticatedPage.menu.toggleDropdown();
      await authenticatedPage.menu.settings.click();
      await trackingSection.expand();
      await trackingSection.disableWebsiteReferrer.check();
    });

    iit('should strip referrer', async function () {
      await assertReferrers(true);
    });
  });

  async function assertReferrers(shouldStrip: boolean) {
    async function runAssertion(frame: Frame) {
      const { switchFromFrame, status } = await referrerPage.switchToReferrerFrame(frame);
      const text = await status.getText();
      await switchFromFrame();
      if (shouldStrip) {
        expect(text).to.eq(strippedText);
      }
      else {
        expect(text).to.not.eq(strippedText);
      }
    }
    await referrerPage.navigate();
    await runAssertion(Frame.NO_REFERRER);
    await runAssertion(Frame.REFERRER);
    await runAssertion(Frame.POST_FORM);
    await runAssertion(Frame.GET_FORM);
  }
});
