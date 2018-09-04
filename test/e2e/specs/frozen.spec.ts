import { idescribe, iit } from '../core';
import { expect } from 'chai';
import { getFrozen } from '../scripts/getFrozen';
import { LoginPage } from '../pages/login';

idescribe('frozen', function () {
  beforeEach(async function () {
    await new LoginPage().navigate();
  });

  iit('is disabled', async function () {
    const frozen = await getFrozen(this.script);

    expect(frozen, 'application should not be frozen').to.be.false;
  });
});
