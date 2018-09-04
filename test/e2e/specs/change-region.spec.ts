import { idescribe, iit, ibeforeEach } from '../core';
import { LoginPage } from '../pages/login';
import { AuthenticatedPage } from '../pages/authenticated';
import { RegionPage } from '../pages/region';
import { Button } from '../elements';
import { getConnected } from '../scripts/getConnected';
import { expect } from 'chai';

idescribe('the change region page', function () {
  let loginPage: LoginPage;
  let authPage: AuthenticatedPage;
  let regionPage: RegionPage;
  let gridIcon: Button;
  let listIcon: Button;

  ibeforeEach(async function () {
    // Init
    loginPage = new LoginPage();
    authPage = new AuthenticatedPage();
    regionPage = new RegionPage();
    ({ gridIcon } = regionPage.layout);
    ({ listIcon } = regionPage.layout);

    // Navigate
    await loginPage.navigate();
    await loginPage.signIn();
    await authPage.region.regionName.click();
  });

  idescribe('grid view', function () {
    ibeforeEach(async function () {
      await gridIcon.click();
    });

    iit('is shown when clicking grid view', async function () {
      await regionPage.expectGridShown();
    });

    iit('is remembered as default', async function () {
      await regionPage.back.click();
      await authPage.region.regionName.click();
      await regionPage.expectGridShown();
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

  idescribe('list view', function () {
    iit('is shown when clicking list view', async function () {
      await gridIcon.click();
      await listIcon.click();
      await regionPage.expectListShown();
    });

    iit('is remembered as default', async function () {
      await gridIcon.click();
      await listIcon.click();
      await regionPage.back.click();
      await authPage.region.regionName.click();
      await regionPage.expectListShown();
    });

    iit('is default', async function () {
      await regionPage.expectListShown();
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

    idescribe('sorting', function () {
      iit('sort by name is default', async function () {
        await regionPage.expectActiveSort(RegionPage.SORT_BY_NAME);
      });

      iit('sort by latency becomes default', async function () {
        await regionPage.sort.selectOption(RegionPage.SORT_BY_LATENCY);
        await regionPage.back.click();
        await authPage.region.regionName.click();
        await regionPage.expectActiveSort(RegionPage.SORT_BY_LATENCY);
      });

      iit('sorting by latency includes ping times of regions', async function () {
        await regionPage.sort.selectOption(RegionPage.SORT_BY_LATENCY);
        await regionPage.picker.melbourneLatency.expect.visible;
      });
    });
  });
});
