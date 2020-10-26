import { idescribe, iit, ibeforeEach } from '../core';
import { translate } from '../scripts/translate';
import { AuthFailPage } from '../pages/authfail';
import { expect } from 'chai';

idescribe('the page shown on authentication failure', function () {
  let authfailPage: AuthFailPage;

  ibeforeEach(async function () {
    // Init
    authfailPage = new AuthFailPage();

    // Nav
    await authfailPage.navigate();
  });

  iit('contains valid contents', async function () {
    const expectedTitle = await translate(this.script, 'AuthFailTitle');
    const expectedMessage = await translate(this.script, 'AuthFailMessage');
    const expectedSupportLead = await translate(this.script, 'AuthFailMessageSupportLead');
    const expectedSupportLink = 'https://privateinternetaccess.com/helpdesk';
    const expectedPageTitle = await translate(this.script, 'AuthFailPageTitle');
    const actualMessage = await authfailPage.message.getText();
    const actualSupportLead = await authfailPage.supportLead.getText();
    const actualSupportLink = await authfailPage.supportLink.getHref();
    const actualTitle = await authfailPage.title.getText();

    // Assert
    expect(actualMessage).to.eq(expectedMessage);
    expect(actualSupportLead).to.eq(expectedSupportLead);
    expect(actualSupportLink).to.eq(expectedSupportLink);
    expect(actualTitle).to.eq(expectedTitle);
    await this.windows.expectCurrentTitleIs(expectedPageTitle);
  });

  iit('contains a "support team" button that opens help desk', async function () {
    await authfailPage.supportLink.click();
    await this.windows.expectCurrentUrlIs('https://www.privateinternetaccess.com/helpdesk/');
  });
});
