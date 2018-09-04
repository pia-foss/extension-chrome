import { PageObject } from '../../core';
import { createSelector } from '../../core/entities/selector';
import { Text, Button } from '../../elements';

class ConnFailPage extends PageObject {
  public title: Text;
  public error: Text;
  public message: Text;
  public tryAgainButton: Button;

  constructor() {
    super({
      selector: createSelector({
        value: '.container',
      }),
      name: 'connection failed page',
    });
    this.title = new Text(
      {
        selector: createSelector({
          value: '#title',
        }),
        name: 'title',
      },
      this,
    );
    this.error = new Text(
      {
        selector: createSelector({
          value: '#error',
        }),
        name: 'error',
      },
      this,
    );
    this.message = new Text(
      {
        selector: createSelector({
          value: '#message',
        }),
        name: 'message',
      },
      this,
    );
    this.tryAgainButton = new Button(
      {
        selector: createSelector({
          value: '#try-again',
        }),
        name: 'tryAgainButton',
      },
      this,
    );
  }

  protected path() {
    return 'html/errorpages/connfail.html';
  }
}

export { ConnFailPage };
