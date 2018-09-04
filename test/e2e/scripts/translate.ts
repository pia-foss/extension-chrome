import { Script } from '../core';

interface TranslateOpts {

}

interface Payload {
  key: string;
  opts: TranslateOpts;
}

function translate(script: Script, key: string, opts: TranslateOpts = {}) {
  return script.executeAsync<Payload, string>(
    function ({ key, opts }, done) {
      chrome.runtime.getBackgroundPage(({ app }: any) => {
        const { t } = app.util.i18n;

        done(t(key, opts));
      });
    },
    { key, opts },
  );
}

export { translate };
