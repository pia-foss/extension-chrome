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
    await authPage.waitForLatencyTest();
  });

  idescribe('the on/off switch', function () {
    let expectedConnectionMessage: string;

    ibeforeEach(async function () {
      expectedConnectionMessage = (await translate(this.script, 'Connected')).toUpperCase();
    });

    iit('default state is "off"', async function () {
      await authPage.expectSwitchOff();
    });

    idescribe('when toggled on', function () {
      ibeforeEach(async function () {
        await authPage.switchOn();
      });

      iit('the status text is "CONNECTED"', async function () {
        const actualConnectedText = await authPage.getConnectedText();
        expect(actualConnectedText).to.eq(expectedConnectionMessage);
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

      iit('the status text is company logo', async function () {
        const actualAltText = await authPage.getDisconnectedImage();
        expect(actualAltText).to.eq('Private Internet Access Logo');
      });

      iit('the browser does not tunnel it\'s traffic through a PIA proxy', async function () {
        const connected = await getConnected(this.script);
        expect(connected, 'expected not connected').to.be.false;
      });
    });
  });

  idescribe('the current region', function () {
    let regionPage: RegionPage;

    ibeforeEach(async function () {
      regionPage = new RegionPage();
    });

    iit('regions are visible', async function () {
      const regionTile = authPage.tiles.getCurrentRegionTile();
      const expectedName = await translate(this.script, 'aus_melbourne');
      await regionTile.changeRegion.click();
      await regionPage.picker.melbourneRegion.click();
      const actualName = await regionTile.regionName.getText();
      expect(actualName).to.eq(expectedName);
    });
  });

  idescribe('when the icon is clicked for', function () {
    idescribe('settings', function () {
      let settingsPage: SettingsPage;

      ibeforeEach(async function () {
        settingsPage = new SettingsPage();
        await authPage.menu.toggleDropdown();
        await authPage.menu.settings.click();
      });

      iit('the settings page is shown', async function () {
        await settingsPage.expect.visible;
      });
    });

    idescribe('account', function () {
      ibeforeEach(async function () {
        await authPage.menu.toggleDropdown();
        await authPage.menu.account.click();
      });

      iit('the client control panel page is opened in a new tab', async function () {
        const expectedUrl = 'https://www.privateinternetaccess.com/pages/client-sign-in';
        await this.windows.expectNextTabIs(expectedUrl);
      });
    });

    idescribe('help', function () {
      ibeforeEach(async function () {
        await authPage.menu.toggleDropdown();
        await authPage.menu.help.click();
      });

      iit('the helpdesk page is opened in a new tab', async function () {
        const expectedUrl = 'https://www.privateinternetaccess.com/helpdesk/';
        await this.windows.expectNextTabIs(expectedUrl);
      });
    });

    idescribe('logout', function () {
      ibeforeEach(async function () {
        await authPage.menu.toggleDropdown();
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

    idescribe('drawer', function () {
      idescribe('open drawer', function () {
        iit('open the drawer', async function () {
          await authPage.tiles.handle.click();
          await authPage.tiles.renderable.waitForVisible();
        });
      });

      idescribe('close drawer', function () {
        iit('close the drawer', async function () {
          await authPage.tiles.handle.click();
          await authPage.tiles.renderable.waitForVisible();
          await authPage.tiles.handle.click();
          const isOpen = await authPage.tiles.isDrawerOpen();
          expect(isOpen).to.eq(false);
        });
      });
    });
  });
});
