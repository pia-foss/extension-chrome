import { idescribe, iit, ibeforeEach } from '../core';
import { AuthenticatedPage } from '../pages/authenticated';
import { LoginPage } from '../pages/login';
import { translate } from '../scripts/translate';
import { expect } from 'chai';
import { getConnected } from '../scripts/getConnected';
import { RegionPage } from '../pages/region';
import { SettingsPage } from '../pages/settings';
import { getStorage } from '../scripts/getStorage';

idescribe('on the authenticated page', function () {
  let authPage: AuthenticatedPage;
  let loginPage: LoginPage;

  ibeforeEach(async function () {
    authPage = new AuthenticatedPage();
    loginPage = new LoginPage();

    await loginPage.navigate();
    await loginPage.signIn();
  });

  idescribe('the on/off switch', function () {
    let expectedEnabledMessage: string;
    let expectedDisabledMessage: string;

    ibeforeEach(async function () {
      expectedEnabledMessage = (await translate(this.script, 'enabled')).toUpperCase();
      expectedDisabledMessage = (await translate(this.script, 'disabled')).toUpperCase();
    });

    iit('default state is "off"', async function () {
      await authPage.expectSwitchOff();
    });

    idescribe('when toggled on', function () {
      ibeforeEach(async function () {
        await authPage.switchOn();
      });

      iit('the status text is "ENABLED"', async function () {
        const actualStatusText = await authPage.status.getText();
        expect(actualStatusText).to.eq(expectedEnabledMessage);
      });
      iit('the browser tunnels its traffic through a PIA proxy', async function () {
        const connected = await getConnected(this.script);
        expect(connected).to.be.true;
      });
    });

    idescribe('when toggled on then off', function () {
      ibeforeEach(async function () {
        await authPage.switchOn();
        await authPage.switchOff();
      });

      iit('the status text is "DISABLED"', async function () {
        const actualStatusText = await authPage.status.getText();
        expect(actualStatusText).to.eq(expectedDisabledMessage);
      });
      iit('the browser does not tunnel it\'s traffic through a PIA proxy', async function () {
        const connected = await getConnected(this.script);
        expect(connected).to.be.false;
      });
    });
  });

  idescribe('the current region', function () {
    let regionPage: RegionPage;

    ibeforeEach(async function () {
      regionPage = new RegionPage();
    });

    iit('name is visible', async function () {
      const expectedName = await translate(this.script, 'aus_melbourne');
      await authPage.region.regionName.click();
      await regionPage.picker.melbourneRegion.click();
      const actualName = await authPage.region.regionName.getLabel();
      expect(actualName).to.eq(expectedName);
    });
  });

  idescribe('when the icon is clicked for', function () {
    idescribe('settings', function () {
      let settingsPage: SettingsPage;

      ibeforeEach(async function () {
        settingsPage = new SettingsPage();
        await authPage.menu.settings.click();
      });

      iit('the settings page is shown', async function () {
        await settingsPage.expect.visible;
      });
    });

    idescribe('account', function () {
      ibeforeEach(async function () {
        await authPage.menu.account.click();
      });

      iit('the client control panel page is opened in a new tab', async function () {
        const expectedUrl = 'https://www.privateinternetaccess.com/pages/client-control-panel';
        await this.windows.expectNextTabIs(expectedUrl);
      });
    });

    idescribe('help', function () {
      ibeforeEach(async function () {
        await authPage.menu.help.click();
      });

      iit('the helpdesk page is opened in a new tab', async function () {
        const expectedUrl = 'https://www.privateinternetaccess.com/helpdesk/';
        await this.windows.expectNextTabIs(expectedUrl);
      });
    });

    idescribe('logout', function () {
      ibeforeEach(async function () {
        await authPage.menu.logout.click();
      });

      iit('the user is logged out', async function () {
        const userStatus = await getStorage(this.script, 'loggedIn');
        expect(String(userStatus)).to.eq('false');
      });

      iit('the login page is rendered', async function () {
        await loginPage.expect.visible;
      });
    });
  });
});
