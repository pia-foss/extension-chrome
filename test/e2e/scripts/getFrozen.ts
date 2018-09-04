import { Script } from '../core';

interface Payload {}

function getFrozen(script: Script) {
  return script.executeAsync<Payload, boolean>(
    ({}, done) => {
      chrome.runtime.getBackgroundPage((window: any) => {
        const { app } = window;

        done(app.frozen);
      });
    },
    {},
  );
}

export { getFrozen };
