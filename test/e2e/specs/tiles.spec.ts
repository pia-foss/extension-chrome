import { expect } from 'chai';

import { idescribe, ibeforeEach, iit } from '../core';
import { AuthenticatedPage } from '../pages/authenticated';
import { SubscriptionTile } from '../pages/authenticated/tiles/subscription-tile';
import { SettingName } from '../pages/authenticated/tiles/quick-settings-tile';
import { Tile } from '../pages/authenticated/tiles/tile';
import { LoginPage } from '../pages/login';
import { TileName } from '../pages/authenticated/tiles';
import { SettingsPage } from '../pages/settings';
import { RegionPage } from '../pages/region';
import { getConnected } from '../scripts/getConnected';
import { getStorage } from '../scripts/getStorage';

idescribe('interface tiles', function () {
  let authPage: AuthenticatedPage;
  let loginPage: LoginPage;
  let settingsPage: SettingsPage;
  let regionPage: RegionPage;

  ibeforeEach(async function () {
    authPage = new AuthenticatedPage();
    loginPage = new LoginPage();
    settingsPage = new SettingsPage();
    regionPage = new RegionPage();

    await loginPage.navigate();
    await loginPage.signIn();
    await authPage.waitForLatencyTest();
  });

  idescribe('bookmarks', function () {
    const tileNames: TileName[] = [
      'subscription',
      'quick-connect',
      'current-region',
      'quick-settings',
      'bypass-rules',
      'ip',
    ];
    tileNames.forEach((tileName) => {
      let bothTile: Tile;
      let drawerTile: Tile;
      let outletTile: Tile;

      ibeforeEach(async function () {
        bothTile = authPage.tiles.getTile(tileName, 'both');
        drawerTile = authPage.tiles.getTile(tileName, 'drawer');
        outletTile = authPage.tiles.getTile(tileName, 'outlet');
      });

      iit(`${tileName} tile should display only once`, async function () {
        await authPage.tiles.openDrawer();
        await bothTile.removeBookmark();
        await bothTile.expectCount(1);
        await bothTile.removeBookmark();
        await bothTile.expectCount(1);
        await bothTile.removeBookmark();
        await bothTile.expectCount(1);
      });

      iit(`${tileName} tile can be bookmarked`, async function () {
        await authPage.tiles.openDrawer();

        // Ensure tile is not bookmarked at start (some bookmarked by default)
        await bothTile.removeBookmark();
        await drawerTile.expectCount(1);
        await outletTile.expectCount(0);

        // Act
        await bothTile.bookmark();

        // Assert
        await drawerTile.expectCount(0);
        await outletTile.expectCount(1);
      });

      iit(`${tileName} tile bookmark should persist`, async function () {
        // Ensure tile is not bookmarked at start (some bookmarked by default)
        await authPage.tiles.openDrawer();
        await bothTile.removeBookmark();
        await drawerTile.expectCount(1);
        await outletTile.expectCount(0);

        // Act
        await drawerTile.bookmark();
        await authPage.tiles.closeDrawer();
        await this.windows.refresh();

        // Assert
        await outletTile.expectCount(1);
      });
    });

    iit('should have current region bookmarked as default', async function () {
      const currentRegionTile = authPage.tiles.getCurrentRegionTile('outlet');
      await currentRegionTile.expectCount(1);
    });

    iit('should sort bookmarks in order of enabling them', async function () {
      await authPage.tiles.openDrawer();
      // disable all favorites
      for (const name of tileNames) {
        await authPage.tiles.getTile(name).removeBookmark();
      }
      // enable favorites in order of names
      for (const name of tileNames) {
        await authPage.tiles.getTile(name).bookmark();
      }
      // check order
      const order = await authPage.tiles.getOrder('drawer');
      order.forEach((value, index) => {
        expect(value).to.eq(tileNames[index]);
      });
    });
  });

  idescribe('quick connect', function () {
    iit('successfully connects to region', async function () {
      expect(await getConnected(this.script)).to.be.false;
      const quickConnectTile = authPage.tiles.getQuickConnectTile();
      await authPage.tiles.openDrawer();
      await quickConnectTile.firstRegion.connect();
      await authPage.tiles.closeDrawer();
      await authPage.waitForConnected();
      await authPage.expectSwitchOn();
      expect(await getConnected(this.script), 'expected connected to be true').to.be.true;
    });

    iit('should have regions', async function () {
      await authPage.tiles.openDrawer();
      const tile = authPage.tiles.getQuickConnectTile();
      await tile.expectRegionsCount(6);
    });
  });

  idescribe('quick settings', function () {
    const settingNames: SettingName[] = [
      'mace',
      'http-referrer',
      'debug-log',
      'microphone',
      'camera',
      'theme',
    ];
    settingNames.forEach((name) => {
      iit(`enabling "${name}" quicksetting is applied to setting`, async function () {
        await authPage.tiles.openDrawer();
        const tile = authPage.tiles.getQuickSettingsTile();
        const setting = tile.getSettingButton(name);
        const storageKey = tile.getStorageKey(name);
        const expectedValue = name === 'theme' ? false : true;

        // Start w/ off
        await setting.deactivate();

        // Act
        await setting.activate();

        // Assert
        const storageValue = await getStorage(this.script, storageKey);
        const active = await setting.isActive();
        expect(active).be.true;
        expect(storageValue).to.eq(expectedValue);
      });

      iit(`disabling "${name}" quicksetting is applied to setting`, async function () {
        await authPage.tiles.openDrawer();
        const tile = authPage.tiles.getQuickSettingsTile();
        const setting = tile.getSettingButton(name);
        const storageKey = tile.getStorageKey(name);
        const expectedValue = name === 'theme' ? true : false;

        // Start w/ off
        await setting.activate();

        // Act
        await setting.deactivate();

        // Assert
        const storageValue = await getStorage(this.script, storageKey);
        const active = await setting.isActive();
        expect(active).be.false;
        expect(storageValue).to.eq(expectedValue);
      });
    });

    iit('shows settings page after clicking "all settings"', async function () {
      await authPage.tiles.openDrawer();
      await authPage.tiles.getQuickSettingsTile().viewAll.click();
      await settingsPage.expect.visible;
    });
  });

  idescribe('subscription tile', function () {
    iit('should have a header', async function () {
      await authPage.tiles.openDrawer();
      const { header } = authPage.tiles.getSubscriptionTile();
      await header.waitForTextNotEqual('');
      const headerText = await header.getText();
      expect(headerText).equals('SUBSCRIPTION');
    });

    iit('should have valid period', async function () {
      await authPage.tiles.openDrawer();
      const tile = authPage.tiles.getSubscriptionTile();
      await tile.period.waitForTextNotEqual('');
      const period = await tile.period.getText();
      expect(SubscriptionTile.SUBSCRIPTION_PERIODS).contains(period.toLowerCase());
    });

    iit('should have remaining time', async function () {
      await authPage.tiles.openDrawer();
      const tile = authPage.tiles.getSubscriptionTile();
      await tile.remaining.waitForTextNotEqual('');
      const remaining = await tile.remaining.getText();
      const regex = /^\(\d+ (days|years|months|seconds|milliseconds) left\)$/;
      expect(remaining).to.match(regex);
    });
  });

  idescribe('bypass rules', function () {
    iit('Adds bypass rule', async function () {
      await authPage.tiles.openDrawer();
      const bypassRulesTile = authPage.tiles.getBypassRulesTile();
      await bypassRulesTile.addButton.waitForVisible();
      await bypassRulesTile.addButton.click();
      await bypassRulesTile.removeButton.waitForVisible();
    });

    iit('Remove bypass rule', async function () {
      await authPage.tiles.openDrawer();
      const bypassRulesTile = authPage.tiles.getBypassRulesTile();
      await bypassRulesTile.addButton.click();
      await bypassRulesTile.removeButton.waitForVisible();
      const active = await bypassRulesTile.removeButtonActive();
      expect(active).to.be.false;
    });
  });

  idescribe('current region tile', function () {
    iit('opens region page on click', async function () {
      await authPage.tiles.openDrawer();
      const tile = authPage.tiles.getCurrentRegionTile();
      await tile.changeRegion.click();
      await regionPage.expect.visible;
    });
  });
});
