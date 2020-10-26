import {
  idescribe,
  iit,
  ibeforeEach,
  iafterEach,
} from '../core';
import {
  SettingData,
  createData,
} from '../data/settings.data';
import { LoginPage } from '../pages/login';
import { AuthenticatedPage } from '../pages/authenticated';
import { createPiaUrl } from '../helpers/url';
import { SettingsPage } from '../pages/settings';

type QueryType
  = 'removeUtmParameters'
  | 'removeFbclidParameters'
  | 'normal'
  ;

interface QueryParam {
  key: string;
  value: string;
  type: QueryType;
}

interface TestOpts {
  filterList: QueryType[];
}

const queryParams: QueryParam[] = [
  {
    key: 'utm_source',
    value: 'testsuite',
    type: 'removeUtmParameters',
  },
  {
    key: 'utm_medium',
    value: 'capybara',
    type: 'removeUtmParameters',
  },
  {
    key: 'fbclid',
    value: 'asdfghjkl',
    type: 'removeFbclidParameters',
  },
  {
    key: 'randomkey',
    value: 'randomvalue',
    type: 'normal',
  },
];

function createUrl(baseUrl: string, filterList: QueryType[]) {
  const params = queryParams
    .filter((param) => {
      return !filterList.includes(param.type);
    })
    .map(({ key, value }) => {
      return { key, value };
    });
  const url = createPiaUrl(baseUrl, params);

  return url;
}

idescribe('query parameter settings (fbclid & utm)', function () {
  let loginPage: LoginPage;
  let authPage: AuthenticatedPage;
  let baseUrl: string;
  let settingsData: SettingData[];
  let settingsPage: SettingsPage;

  ibeforeEach(async function () {
    // Init
    loginPage = new LoginPage();
    authPage = new AuthenticatedPage();
    baseUrl = 'robots.txt';
    settingsPage = new SettingsPage();
    settingsData = createData();

    await loginPage.navigate();
    await loginPage.signIn();
  });

  iafterEach(async function () {
    baseUrl = '';
  });

  async function setSettings(data: SettingData[], on: boolean) {
    for (const { sectionName, settingName } of data) {
      const section = settingsPage.getSection(sectionName);
      await section.expand();
      await section.getSetting(settingName)[on ? 'check' : 'uncheck']();
      await section.expand();
    }
  }

  function test({
    filterList,
  }: TestOpts) {
    let targetUrl: string;
    let querySettingsData: SettingData[];
    let otherSettingsData: SettingData[];

    ibeforeEach(async function () {
      targetUrl = createUrl(baseUrl, []);
      querySettingsData = [];
      otherSettingsData = [];
      settingsData
        .filter((data) => {
          return !!queryParams.find((param) => {
            return param.type === data.settingName;
          });
        })
        .forEach((data) => {
          if (filterList.includes(data.settingName as any)) {
            querySettingsData.push(data);
          }
          else {
            otherSettingsData.push(data);
          }
        });
    });

    describe('setting on', function () {
      iit('should filter parameters', async function () {
        // Arrange
        await authPage.menu.toggleDropdown();
        await authPage.menu.settings.click();
        await settingsPage.waitForVisible();
        await setSettings(querySettingsData, true);
        await setSettings(otherSettingsData, false);
        const expectedUrl = createUrl(baseUrl, filterList);

        // Act
        await this.windows.open(targetUrl);

        // Assert
        await this.windows.expectCurrentUrlIs(expectedUrl);
      });
    });

    describe('setting off', function () {
      iit('should not filter parameters', async function () {
        // Arrange
        await authPage.menu.toggleDropdown();
        await authPage.menu.settings.click();
        await settingsPage.waitForVisible();
        await setSettings(querySettingsData, false);
        await setSettings(otherSettingsData, true);
        const otherFilters = otherSettingsData.map(({ settingName }) => {
          return settingName;
        }) as QueryType[];
        const expectedUrl = createUrl(baseUrl, otherFilters);

        // Act
        await this.windows.open(targetUrl);

        // Assert
        await this.windows.expectCurrentUrlIs(expectedUrl);
      });
    });
  }

  idescribe('utm parameters', function () {
    test.call(this, {
      filterList: ['removeUtmParameters'],
    });
  });

  idescribe('fbclid parameters', function () {
    test.call(this, {
      filterList: ['removeFbclidParameters'],
    });
  });

  idescribe('all filters', function () {
    test.call(this, {
      filterList: ['removeUtmParameters', 'removeFbclidParameters'],
    });
  });
});
