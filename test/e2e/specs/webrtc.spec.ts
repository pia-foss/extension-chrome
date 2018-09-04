import { idescribe, iit, ibeforeEach } from '../core';
import { LoginPage } from '../pages/login';
import { AuthenticatedPage } from '../pages/authenticated';
import { LeakCheckPage } from '../pages/leaks';
import { expect } from 'chai';

idescribe('The block WebRTC setting', function () {
  let loginPage: LoginPage;
  let authPage: AuthenticatedPage;
  let leakPage: LeakCheckPage;

  ibeforeEach(async function () {
    loginPage = new LoginPage();
    authPage = new AuthenticatedPage();
    leakPage = new LeakCheckPage();

    await loginPage.navigate();
    await loginPage.signIn();
  });

  idescribe('when enabled', function () {
    ibeforeEach(async function () {
      await authPage.switchOn();
      await leakPage.navigate();
    });

    iit('public address is not detected', async function () {
      const local = await leakPage.rtcLocal.getText();
      expect(local).to.equal('n/a');
    });

    iit('private address is not detected', async function () {
      const ipv4 = await leakPage.rtcIpv4.getText();
      expect(ipv4).to.equal('n/a');
    });

    iit('ipv6 address is not detected', async function () {
      const ipv6 = await leakPage.rtcIpv6.getText();
      expect(ipv6).to.equal('n/a');
    });
  });

  idescribe('when disabled', function () {
    ibeforeEach(async function () {
      await leakPage.navigate();
    });

    iit('public ip address is detected', async function () {
      const ipv4 = await leakPage.rtcIpv4.getText();
      expect(ipv4).to.match(/\d+/);
    });
  });
});
