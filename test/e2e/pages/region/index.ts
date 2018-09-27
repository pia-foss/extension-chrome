import { PageObject } from '../../core';
import { createSelector } from '../../core/entities/selector';
import { Dropdown, Button } from '../../elements';
import { RegionLayout } from './layout';
import { RegionPicker } from './picker';
import { RegionTabs } from './tabs';
import { expect } from 'chai';

class RegionPage extends PageObject {
  public static readonly SORT_BY_LATENCY = 'sort-by-latency';
  public static readonly SORT_BY_NAME = 'sort-by-name';
  public sort: Dropdown;
  public layout: RegionLayout;
  public picker: RegionPicker;
  public tabs: RegionTabs;
  public back: Button;

  constructor() {
    super({
      selector: createSelector({
        value: '#change-region-template',
      }),
      name: 'region page',
    });
    this.sort = new Dropdown(
      {
        selector: createSelector({
          value: '#region-sorter-dropdown',
        }),
        name: 'region sort',
      },
      this,
      RegionPage.SORT_BY_LATENCY,
      RegionPage.SORT_BY_NAME,
    );
    this.back = new Button({
      selector: createSelector({
        value: '.back-icon',
      }),
      name: 'back',
    });
    this.layout = new RegionLayout(this);
    this.picker = new RegionPicker(this);
    this.tabs = new RegionTabs(this);
  }

  public async expectGridShown() {
    await this.picker.grid.expect.visible;
  }

  public async expectListShown() {
    await this.picker.list.expect.visible;
  }

  async expectActiveSort(id: string) {
    const activeSort = await this.sort.getActive();
    expect(activeSort).to.eq(id);
  }
}

export { RegionPage };
