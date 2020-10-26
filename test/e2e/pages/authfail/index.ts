import { PageObject } from '../../core';
import { createSelector } from '../../core/entities/selector';
import { Text, Image, Link } from '../../elements';

class AuthFailPage extends PageObject {
  public title: Text;
  public logo: Image;
  public image: Image;
  public message: Text;
  public supportLead: Text;
  public supportLink: Link;

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
          value: '.error-message',
        }),
        name: 'message',
      },
      this,
    );
    this.supportLead = new Text(
      {
        selector: createSelector({
          value: '.error-support-lead',
        }),
        name: 'support lead',
      },
      this,
    );
    this.supportLink = new Link(
      {
        selector: createSelector({
          value: '.error-support > a',
        }),
        name: 'support link',
      },
      this,
    );
  }

  public async loadExtension() {
    return this.sleep(1000);
  }

  protected path() {
    return 'html/errorpages/authfail.html';
  }
}

export { AuthFailPage };
