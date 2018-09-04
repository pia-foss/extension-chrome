import { Script } from '../core';

interface Payload {}

function getConnected(script: Script): Promise<boolean> {
  return script.executeAsync<Payload, boolean>(
    function (_, done) {
      fetch('https://www.privateinternetaccess.com/api/client/services/https/status')
        .then((response) => {
          return response.text();
        })
        .then((result) => {
          const { connected } = JSON.parse(result);

          done(connected);
        })
        .catch((err) => {
          console.error(`getConnected: ${JSON.stringify(err, Object.getOwnPropertyNames(err))}`);
        });
    },
    {},
  );
}

export { getConnected };
