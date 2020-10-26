import { idescribe, iit, ibeforeEach } from '../core';
import { LoginPage } from '../pages/login';
import { AuthenticatedPage } from '../pages/authenticated';
import { CurrentRegionTile } from '../pages/authenticated/tiles/current-region-tile';
import { RegionPage } from '../pages/region';
import { Button } from '../elements';
import { getConnected } from '../scripts/getConnected';
import { expect } from 'chai';

idescribe('the change region page', function () {
  let loginPage: LoginPage;
  let authPage: AuthenticatedPage;
  let regionPage: RegionPage;
  let nameButton: Button;
  let latencyButton: Button;
  let favoritesButton: Button;
  let regionTile: CurrentRegionTile;

  ibeforeEach(async function () {
    // Init
    loginPage = new LoginPage();
    authPage = new AuthenticatedPage();
    regionPage = new RegionPage();
    nameButton = regionPage.tabs.nameSort;
    latencyButton = regionPage.tabs.latencySort;
    favoritesButton = regionPage.tabs.favoritesSort;
    regionTile = authPage.tiles.getCurrentRegionTile();

    // Navigate
    await loginPage.navigate();
    await loginPage.signIn();
    await authPage.waitForLatencyTest();
    await regionTile.changeRegion.click();
  });

  idescribe('Sort by Name', function () {
    iit('is shown when clicking name sort', async function () {
      await latencyButton.click();
      await nameButton.click();
      await regionPage.expectNameSortActive();
    });

    iit('is remembered as default', async function () {
      await latencyButton.click();
      await nameButton.click();
      await regionPage.back.click();
      await regionTile.changeRegion.click();
      await regionPage.expectNameSortActive();
    });

    iit('is default', async function () {
      await regionPage.expectNameSortActive();
    });

    iit('regions include ping times', async function () {
      await regionPage.picker.melbourneLatency.expect.visible;
    });

    idescribe('clicking region', function () {
      iit('connects to that region', async function () {
        await regionPage.picker.melbourneRegion.click();
        const connected = await getConnected(this.script);
        expect(connected).to.be.true;
      });

      iit('shows the authenticated page', async function () {
        await regionPage.picker.melbourneRegion.click();
        await authPage.expect.visible;
      });
    });
  });

  idescribe('Sort by Latency', function () {
    ibeforeEach(async function () {
      await latencyButton.click();
    });

    iit('is shown when clicking latency sort', async function () {
      await regionPage.expectLatencySortActive();
    });

    iit('is remembered as default', async function () {
      await regionPage.back.click();
      await regionTile.changeRegion.click();
      await regionPage.expectLatencySortActive();
    });

    iit('regions include ping times', async function () {
      await regionPage.picker.melbourneLatency.expect.visible;
    });

    idescribe('clicking region', function () {
      ibeforeEach(async function () {
        await regionPage.picker.melbourneRegion.click();
      });

      iit('connects to that region', async function () {
        const connected = await getConnected(this.script);
        expect(connected).to.be.true;
      });
      iit('shows the authenticated page', async function () {
        await authPage.expect.visible;
      });
    });
  });

  idescribe('Favorites Filter', function () {
    iit('is shown when clicking favorite sort', async function () {
      await favoritesButton.click();
      await regionPage.expectFavoritesSortActive();
    });

    iit('is remembered as default', async function () {
      await favoritesButton.click();
      await regionPage.back.click();
      await regionTile.changeRegion.click();
      await regionPage.expectFavoritesSortActive();
    });

    iit('regions include ping times', async function () {
      await regionPage.picker.melbourneFavorite.click();
      await favoritesButton.click();
      await regionPage.picker.melbourneLatency.expect.visible;
    });

    iit('should favorite a region', async function () {
      await regionPage.picker.melbourneFavorite.click();
      await regionPage.picker.isMelbourneFavorite(true);
      await favoritesButton.click();
      await regionPage.picker.melbourneFavorite.expect.visible;
    });

    iit('should unfavorite a region', async function () {
      await regionPage.picker.melbourneFavorite.click();
      await regionPage.picker.isMelbourneFavorite(true);
      await regionPage.picker.melbourneFavorite.click();
      await regionPage.picker.isMelbourneFavorite(false);
      await favoritesButton.click();
      await regionPage.picker.melbourneFavorite.expect.not.visible;
    });

    idescribe('clicking region', function () {
      ibeforeEach(async function () {
        await regionPage.picker.melbourneFavorite.click();
        await favoritesButton.click();
        await regionPage.picker.melbourneRegion.click();
      });

      iit('connects to that region', async function () {
        const connected = await getConnected(this.script);
        expect(connected).to.be.true;
      });
      iit('shows the authenticated page', async function () {
        await authPage.expect.visible;
      });
    });
  });
});
