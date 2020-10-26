import { PageObject } from '../../core';
import { createSelector } from '../../core/entities/selector';
import { Input, Button, Checkbox, Link, Container, Text } from '../../elements';

class LoginPage extends PageObject {
  private logo: Container;
  public username: Input;
  public password: Input;
  public submit: Button;
  public reset: Link;
  public join: Button;
  public rememberMe: Checkbox;
  public errorMessage: Text;

  constructor() {
    super({
      selector: createSelector({
        value: '#login-page',
      }),
      name: 'login page',
    });
    this.username = new Input(
      {
        selector: createSelector({
          value: 'input[name="username"]',
        }),
        name: 'username',
      },
      this,
    );
    this.password = new Input(
      {
        selector: createSelector({
          value: 'input[name="password"]',
        }),
        name: 'password',
      },
      this,
    );
    this.submit = new Button(
      {
        selector: createSelector({
          value: '.btn-submit',
        }),
        name: 'submit',
      },
      this,
    );
    this.reset = new Link(
      {
        selector: createSelector({
          value: '.other-options > .reset',
        }),
        name: 'reset',
      },
      this,
    );
    this.join = new Button(
      {
        selector: createSelector({
          value: '.other-options > .join',
        }),
        name: 'sign up',
      },
      this,
    );
    this.rememberMe = new Checkbox(
      {
        selector: createSelector({
          value: '#remember-checkbox',
        }),
        name: 'remember me',
      },
      this,
    );
    this.errorMessage = new Text(
      {
        selector: createSelector({
          value: '.text-danger',
        }),
        name: 'error message',
      },
      this,
    );
    this.logo = new Container(
      {
        selector: createSelector({
          value: '.company-logo',
        }),
        name: 'logo',
      },
      this,
    );
  }

  private async signInWith(username: string, password: string) {
    await this.username.setValue(username);
    await this.password.setValue(password);
    await this.submit.click();
  }

  private async removeTooltip() {
    await this.logo.click();
  }

  public async signInWithWhitespace() {
    const username = `   ${process.env.TEST_USERNAME}   `;
    const password = process.env.TEST_PASSWORD;
    if (!username || !password) {
      throw new Error(`
        Failed to find TEST_USERNAME/TEST_PASSWORD in environment

        hint: check your .env file
      `);
    }
    await this.signInWith(username, password);
  }

  public async signIn() {
    const username = process.env.TEST_USERNAME;
    const password = process.env.TEST_PASSWORD;
    if (!username || !password) {
      throw new Error(`
        Failed to find TEST_USERNAME/TEST_PASSWORD in environment

        hint: check your .env file
      `);
    }
    await this.signInWith(username, password);
  }

  public async failToSignIn() {
    const username = 'invalid_username';
    const password = 'invalid_password';
    await this.signInWith(username, password);
  }

  public async toggleRememberMe() {
    await this.rememberMe.toggle();
    await this.removeTooltip();
  }

  public async checkRememberMe() {
    await this.rememberMe.check();
    await this.removeTooltip();
  }

  public async uncheckRememberMe() {
    await this.rememberMe.uncheck();
    await this.removeTooltip();
  }
}

export { LoginPage };
