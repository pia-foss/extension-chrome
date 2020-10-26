import { PageObject, createSelector } from '../../../core';
import { Button, Container } from '../../../elements';
import { QuickSettingsTile } from './quick-settings-tile';
import { QuickConnectTile } from './quick-connect-tile';
import { SubscriptionTile } from './subscription-tile';
import { CurrentRegionTile } from './current-region-tile';
import { BypassRulesTile } from './bypass-rules-tile';
import { IpTile } from './ip-tile';
import { Tile } from './tile';

type TileName
  = 'quick-settings'
  | 'quick-connect'
  | 'subscription'
  | 'current-region'
  | 'ip'
  | 'bypass-rules';

type TileSource
  = 'both'
  | 'drawer'
  | 'outlet';

class AuthenticatedTiles extends PageObject {
  // General
  public handle: Button;
  public arrow: Container;
  public renderable: Container;
  private outlet: Container;
  private drawer: Container;

  constructor(parent: PageObject) {
    super(
      {
        selector: createSelector({
          value: '.authenticated-tiles',
        }),
        name: 'tiles',
      },
      parent,
    );
    this.outlet = new Container(
      {
        selector: createSelector({
          value: '.drawer-outlet',
        }),
        name: 'drawer outlet',
      },
      parent,
    );
    this.drawer = new Container(
      {
        selector: createSelector({
          value: '.drawer',
        }),
        name: 'drawer',
      },
      parent,
    );
    this.handle = new Button(
      {
        selector: createSelector({
          value: '.drawer-handle',
        }),
        name: 'drawer-handle',
      },
      parent,
    );
    this.arrow = new Container(
      {
        selector: createSelector({
          value: '.drawer-handle-arrow',
        }),
        name: 'drawer-handle-arrow',
      },
      this.handle,
    );
    this.renderable = new Container(
      {
        selector: createSelector({
          value: '.drawer-renderable',
        }),
        name: 'drawer-renderable',
      },
      this,
    );
  }

  public getTile(name: TileName, source?: TileSource): Tile {
    switch (name) {
      case 'quick-settings': return this.getQuickSettingsTile(source);
      case 'quick-connect': return this.getQuickConnectTile(source);
      case 'subscription': return this.getSubscriptionTile(source);
      case 'current-region': return this.getCurrentRegionTile(source);
      case 'bypass-rules': return this.getBypassRulesTile(source);
      case 'ip': return this.getIpTile(source);
      default: throw new Error(`no such tile name: ${name}`);
    }
  }

  public getTiles(source: TileSource) {
    const parent = this.getTileParent(source);
    return new Tile(
      {
        selector: createSelector({
          value: '.tile',
        }),
        name: 'tiles',
      },
      parent,
    );
  }

  public getIpTile(source: TileSource = 'both') {
    return new IpTile(
      {
        selector: createSelector({
          value: '.ip-tile',
        }),
        name: 'ip tile',
      },
      this.getTileParent(source),
    );
  }

  public getQuickSettingsTile(source: TileSource = 'both') {
    return new QuickSettingsTile(
      {
        selector: createSelector({
          value: '.quicksettings-tile',
        }),
        name: 'quicksettings tile',
      },
      this.getTileParent(source),
    );
  }

  public getQuickConnectTile(source: TileSource = 'both') {
    return new QuickConnectTile(
      {
        selector: createSelector({
          value: '.quickconnect-tile',
        }),
        name: 'quickconnect tile',
      },
      this.getTileParent(source),
    );
  }

  public getSubscriptionTile(source: TileSource = 'both') {
    return new SubscriptionTile(
      {
        selector: createSelector({
          value: '.subscription-tile',
        }),
        name: 'subscription tile',
      },
      this.getTileParent(source),
    );
  }

  public getCurrentRegionTile(source: TileSource = 'both') {
    return new CurrentRegionTile(
      {
        selector: createSelector({
          value: '.regiontile-tile',
        }),
        name: 'current region tile',
      },
      this.getTileParent(source),
    );
  }

  public getBypassRulesTile(source: TileSource = 'both') {
    return new BypassRulesTile(
      {
        selector: createSelector({
          value: '.bypassrules-tile',
        }),
        name: 'bypass rules tile',
      },
      this.getTileParent(source),
    );
  }

  public async toggleDrawer() {
    await this.handle.click();
  }

  public async openDrawer() {
    const open = await this.isDrawerOpen();
    if (!open) {
      await this.toggleDrawer();
    }
  }

  public async closeDrawer() {
    const open = await this.isDrawerOpen();
    if (open) {
      await this.toggleDrawer();
    }
  }

  public async isDrawerOpen() {
    const hasClass = await this.arrow.hasClass('open');
    return !!hasClass;
  }

  public async getOrder(source: TileSource): Promise<TileName[]> {
    const tiles = this.getTiles(source);
    const classNames = await tiles.getClassnames();
    return classNames.map((className) => {
      if (className.includes('subscription-tile')) { return 'subscription'; }
      if (className.includes('regiontile-tile')) { return 'current-region'; }
      if (className.includes('quicksettings-tile')) { return 'quick-settings'; }
      if (className.includes('quickconnect-tile')) { return 'quick-connect'; }
      if (className.includes('bypassrules-tile')) { return 'bypass-rules'; }
      if (className.includes('ip-tile')) { return 'ip'; }
      throw new Error(`unknown className: ${className}`);
    });
  }

  private getTileParent(source: TileSource) {
    switch (source) {
      case 'both': return this;
      case 'drawer': return this.drawer;
      case 'outlet': return this.outlet;
      default: throw new Error(`no such source: ${source}`);
    }
  }
}

export { AuthenticatedTiles, TileName, TileSource };
