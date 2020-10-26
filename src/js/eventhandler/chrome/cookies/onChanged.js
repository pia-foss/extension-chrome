/*
  *** WARNING ***
  This event handler is always active. It could be run while a direct connection is being
  used, while another proxy extension is active, or while the Private Internet Access
  extension is active.

  Being unaware of this could introduce serious bugs that compromise the security of the
  extension.

*/
import createApplyListener from '@helpers/applyListener';

export default createApplyListener((app, addListener) => {
  const { util: { httpsUpgrade } } = app;
  addListener(httpsUpgrade.onCookieChanged);
});
