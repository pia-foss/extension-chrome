import { PageObject } from '../../core';
import { createSelector } from '../../core/entities/selector';
import { Button } from '../../elements';
import { RegionPicker } from './picker';
import { RegionTabs } from './tabs';
import { expect } from 'chai';

class RegionPage extends PageObject {
  public picker: RegionPicker;
  public tabs: RegionTabs;
  public back: Button;

  constructor() {
    super({
      selector: createSelector({
        value: '#change-region-page',
      }),
      name: 'region page',
    });
    this.back = new Button({
      selector: createSelector({
        value: '.back-icon',
      }),
      name: 'back',
    });
    this.picker = new RegionPicker(this);
    this.tabs = new RegionTabs(this);
  }

  async expectNameSortActive() {
    const activeSort = await this.tabs.nameSort.hasClass('active');
    expect(activeSort).to.eq(true);
  }

  async expectLatencySortActive() {
    const activeSort = await this.tabs.latencySort.hasClass('active');
    expect(activeSort).to.eq(true);
  }

  async expectFavoritesSortActive() {
    const activeSort = await this.tabs.favoritesSort.hasClass('active');
    expect(activeSort).to.eq(true);
  }
}

export { RegionPage };
