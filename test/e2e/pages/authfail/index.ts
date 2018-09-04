import { PageObject } from '../../core';
import { createSelector } from '../../core/entities/selector';
import { Text, Image, Link } from '../../elements';

class AuthFailPage extends PageObject {
  public title: Text;
  public logo: Image;
  public image: Image;
  public message: Text;
  public support: Link;

  constructor() {
    super({
      selector: createSelector({
        value: '.container',
      }),
      name: 'authentication failed page',
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
    this.logo = new Image(
      {
        selector: createSelector({
          value: '#PIALogo',
        }),
        name: 'logo',
      },
      this,
    );
    this.image = new Image(
      {
        selector: createSelector({
          value: '.leftcontainer > img',
        }),
        name: 'image',
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
    this.support = new Link(
      {
        selector: createSelector({
          value: '#message > a',
        }),
        name: 'support',
      },
      this,
    );
  }

  protected path() {
    return 'html/errorpages/authfail.html';
  }
}

export { AuthFailPage };
