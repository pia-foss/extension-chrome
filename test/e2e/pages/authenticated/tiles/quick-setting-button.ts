import { Button } from '../../../elements';

class QuickSettingButton extends Button {
  public async activate() {
    const active = await this.isActive();
    if (!active) {
      await this.toggle();
    }
  }

  public async deactivate() {
    const active = await this.isActive();
    if (active) {
      await this.toggle();
    }
  }

  public async isActive(): Promise<boolean> {
    return this.hasClass('active');
  }

  private async toggle() {
    await this.click();
  }
}

export { QuickSettingButton };
