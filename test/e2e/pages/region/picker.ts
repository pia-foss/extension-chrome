import { expect } from 'chai';
import { PageObject } from '../../core';
import { Button, Container } from '../../elements';
import { createSelector } from '../../core/entities/selector';

class RegionPicker extends PageObject {
  public melbourneRegion: Button;
  public melbourneFlagList: Button;
  public melbourneFlagGrid: Button;
  public melbourneLatency: Button;
  public melbourneFavorite: Button;
  public list: Container;
  public loader: Container;

  constructor(parent: PageObject) {
    super(
      {
        selector: createSelector({
          value: '.regions',
        }),
        name: 'selector',
      },
      parent,
    );
    this.list = new Container(
      {
        selector: createSelector({
          value: '.region-list',
        }),
        name: 'list',
      },
      this,
    );
    this.melbourneRegion = new Button(
      {
        selector: createSelector({
          value: '*[data-region-id=aus_melbourne]',
        }),
        name: 'melbourneRegion',
      },
      this,
    );
    this.melbourneFlagList = new Button(
      {
        selector: createSelector({
          value: '*[data-region-id=aus_melbourne] .flag',
        }),
        name: 'melbourneFlagList',
      },
      this,
    );
    this.melbourneFlagGrid = new Button(
      {
        selector: createSelector({
          value: '*[data-region-id=aus_melbourne] .flag > img',
        }),
        name: 'melbourneFlagGrid',
      },
      this,
    );
    this.melbourneLatency = new Button(
      {
        selector: createSelector({
          value: '*[data-region-id=aus_melbourne] .list-item-latency',
        }),
        name: 'melbourneLatency',
      },
      this,
    );
    this.melbourneFavorite = new Button(
      {
        selector: createSelector({
          value: '*[data-region-id=aus_melbourne] .heart-container',
        }),
        name: 'melbourneFavorite'
      },
      this,
    ),
    this.loader = new Container(
      {
        selector: createSelector({
          value: '.loader',
        }),
        name: 'loader',
      },
      this,
    );
  }

  async isMelbourneFavorite(value: boolean) {
    const activeSort = await this.melbourneFavorite.hasClass('active');
    expect(activeSort).to.eq(value);
  }
}

export { RegionPicker };
