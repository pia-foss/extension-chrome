import { LoginPage } from '../pages/login';
import { AuthenticatedPage } from '../pages/authenticated';
import { idescribe, iit, Context } from '../core';
import { getStorage } from '../scripts/getStorage';
import { expect } from 'chai';
import { StorageType } from '../types';

idescribe('login page', function () {
  let loginPage: LoginPage;
  let authenticatedPage: AuthenticatedPage;

  beforeEach(async function () {
    loginPage = new LoginPage();
    authenticatedPage = new AuthenticatedPage();
    await loginPage.navigate();
  });

  idescribe('the login button', function () {
    iit('removes whitespace from the username field', async function () {
      await loginPage.signInWithWhitespace();
      await authenticatedPage.expect.visible;
    });
  });

  idescribe('when authentication fails', function () {
    beforeEach(async function () {
      await loginPage.failToSignIn();
    });

    iit('should display an error message', async function () {
      await loginPage.errorMessage.expect.visible;
    });
  });

  idescribe('when authentication succeeds', function () {
    beforeEach(async function () {
      await loginPage.signIn();
    });

    iit('should display the authenticated page', async function () {
      await authenticatedPage.expect.visible;
    });
  });

  idescribe('clicking the reset password link', function () {
    beforeEach(async function () {
      await loginPage.reset.click();
    });

    iit('opens the reset password page', async function () {
      const expectedURL = 'https://www.privateinternetaccess.com/pages/reset-password';
      await this.windows.expectNextTabIs(expectedURL);
    });
  });

  idescribe('the `remember me` checkbox', function () {
    iit('is checked by default', async function () {
      await loginPage.rememberMe.expectChecked();
    });

    idescribe('when checked', function () {
      iit('username and password are present in local storage', async function () {
        await testStorage(this, 'localStorage', false);
      });

      iit('username and password are not present in memory storage', async function () {
        await testStorage(this, 'memoryStorage', true);
      });
    });

    idescribe('when unchecked', function () {
      beforeEach(async function () {
        await loginPage.uncheckRememberMe();
      });

      iit('username and password are not present in local storage', async function () {
        await testStorage(this, 'localStorage', true);
      });

      iit('username and password are present in memory storage', async function () {
        await testStorage(this, 'memoryStorage', false);
      });
    });

    async function testStorage(context: Context, storage: StorageType, expectNull: boolean) {
      // Arrange
      const expectedUsername = 'test-username';
      const expectedPassword = 'test-password';

      // Act
      await loginPage.username.setValue(expectedUsername);
      await loginPage.password.setValue(expectedPassword);
      const usernamePending = getStorage(context.script, 'form:username', storage);
      const passwordPending = getStorage(context.script, 'form:password', storage);
      const [username, password] = await Promise.all([usernamePending, passwordPending]);

      // Assert
      expect(username).to.eq(expectNull ? null : expectedUsername);
      expect(password).to.eq(expectNull ? null : expectedPassword);
    }

    idescribe('when toggled', function () {
      iit('doesn\'t interfere with login', async function () {
        await loginPage.toggleRememberMe();
        await loginPage.toggleRememberMe();
        await loginPage.signIn();
        await authenticatedPage.expect.visible;
      });
    });
  });
});
