import { Script } from '../core';

interface Payload {}

function waitForRules(script: Script) {
  return script.executeAsync<Payload, void>(
    function ({}, done) {
      chrome.runtime.getBackgroundPage(({ app }: any) => {
        const interval = setInterval(
          function () {
            if (!app) { return; }
            if (!app.util) { return; }
            if (!app.util.httpsUpgrade) { return; }
            if (!app.util.httpsUpgrade.rulesets) { return; }
            if (!app.util.httpsUpgrade.rulesets.size) { return; }
            if (app.util.httpsUpgrade.updating) { return; }
            clearInterval(interval);
            done();
          },
          300,
        );
      });
    },
    {},
  );
}

export { waitForRules };
