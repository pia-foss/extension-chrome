import { PageObject } from '../../core';
import { createSelector } from '../../core/entities/selector';
import { Text, Image } from '../../elements';
import { AuthenticatedMenu } from './menu';
import { AuthenticatedTiles } from './tiles';
import { ProxySwitch } from './proxy-switch';

class AuthenticatedPage extends PageObject {
  private switch: ProxySwitch;
  public status: Image;
  public connected: Text;
  public menu: AuthenticatedMenu;
  public tiles: AuthenticatedTiles;

  constructor() {
    super({
      selector: createSelector({
        value: '#authenticated-page',
      }),
      name: 'AuthenticatedPage',
    });
    this.switch = new ProxySwitch(
      {
        selector: createSelector({
          value: '.outer-circle',
        }),
        name: 'ProxySwitch',
      },
      this,
    );
    this.status = new Image(
      {
        selector: createSelector({
          value: '.pia-logo',
        }),
        name: 'PiaLogo',
      },
      this,
    );
    this.connected = new Text(
      {
        selector: createSelector({
          value: '.connected-gradient',
        }),
        name: 'ConnectedGradient',
      },
      this,
    );
    this.menu = new AuthenticatedMenu(this);
    this.tiles = new AuthenticatedTiles(this);
  }

  private async waitForDebounce() {
    await this.sleep(650);
  }

  public async wait(value: number) {
    await this.sleep(value);
  }

  /**
   * Wait for the latency test to complete
   *
   * Because "auto" is the default region, must wait for
   * the latency test to complete before currentRegion
   * is interactive
   */
  public async waitForLatencyTest() {
    await this.tiles.getCurrentRegionTile().waitForLatencyTest();
  }

  public async toggleSwitch() {
    await this.switch.click();
    await this.waitForDebounce();
  }

  public async switchOn() {
    const disabled = await this.switch.hasClass('disconnected');
    if (disabled) { await this.switch.click(); }

    await this.waitForDebounce();
  }

  public async switchOff() {
    await this.switch.waitForConnected();
    const enabled = await this.switch.hasClass('connected');
    if (enabled) { await this.switch.click(); }

    await this.waitForDebounce();
  }

  public async getConnectedText() {
    await this.sleep(1650);
    const error = await this.switch.hasClass('error');
    if (error) { await this.sleep(4000); }
    return await this.connected.getText();
  }

  public async getDisconnectedImage() {
    await this.sleep(1650);
    const error = await this.switch.hasClass('error');
    if (error) { await this.sleep(4000); }
    return await this.status.getAlt();
  }

  public async expectSwitchOn() {
    const error = await this.switch.hasClass('error');
    if (error) { await this.sleep(4000); }
    await this.switch.expectClass('connected');
  }

  public async expectSwitchOff() {
    const error = await this.switch.hasClass('error');
    if (error) { await this.sleep(4000); }
    await this.switch.expectClass('disconnected');
  }

  public async waitForConnected() {
    return this.switch.waitForConnected();
  }
}

export { AuthenticatedPage };
