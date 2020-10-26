import { Script } from '../core';

type LevelOfControl
  = 'not_controllable'
  | 'controlled_by_this_extension'
  | 'controllable_by_this_extension';

interface Payload {
  settingID: string;
  levelOfControl: LevelOfControl;
}

function setLevelOfControl(script: Script, opts: Payload) {
  return script.executeAsync<Payload, void>(
    function ({ settingID, levelOfControl }, done) {
      chrome.runtime.getBackgroundPage((background: any) => {
        const { app } = background;
        app.chromesettings[settingID].levelOfControl = levelOfControl;
        done();
      });
    },
    opts,
  );
}

export { setLevelOfControl };
