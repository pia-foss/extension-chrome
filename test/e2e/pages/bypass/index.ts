import { PageObject } from '../../core';
import { createSelector } from '../../core/entities/selector';
import { Button, Text, Input, Checkbox } from '../../elements';

class BypassPage extends PageObject {
  public settingsWarning: Text;
  public introText: Text;
  public import: Button;
  public export: Button;
  public popularNetflix: Checkbox;
  public popularHulu: Checkbox;
  public addBar: Input;
  public addButton: Button;

  constructor() {
    super({
      selector: createSelector({
        value: '#bypasslist-page',
      }),
      name: 'bypass page',
    });
    this.settingsWarning = new Text(
      {
        selector: createSelector({
          value: '.settingswarning-disconnected',
        }),
        name: 'settingsWarning',
      },
      this,
    );
    this.introText = new Text(
      {
        selector: createSelector({
          value: '.introtext',
        }),
        name: 'introText',
      },
      this,
    );
    this.import = new Button(
      {
        selector: createSelector({
          value: '.import-export-wrapper .import',
        }),
        name: 'import',
      },
      this,
    );
    this.export = new Button(
      {
        selector: createSelector({
          value: '.import-export-wrapper .export',
        }),
        name: 'export',
      },
      this,
    );
    this.popularNetflix = new Checkbox(
      {
        selector: createSelector({
          value: '#netflix',
        }),
        name: 'popularNetflix',
      },
      this,
    );
    this.popularHulu = new Checkbox(
      {
        selector: createSelector({
          value: '#hulu',
        }),
        name: 'popularHulu',
      },
      this,
    );
    this.addBar = new Input(
      {
        selector: createSelector({
          value: '.add-container > input',
        }),
        name: 'addBar',
      },
      this,
    );
    this.addButton = new Button(
      {
        selector: createSelector({
          value: '.add-rule-btn',
        }),
        name: 'addButton',
      },
      this,
    );
  }
}

export { BypassPage };
