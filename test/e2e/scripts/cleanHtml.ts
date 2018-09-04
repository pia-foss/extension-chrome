import { Script } from '../core';

interface Payload {
  html: string;
}

function cleanHtml(script: Script, html: string) {
  return script.execute<Payload, string>(
    ({ html }) => {
      const el = document.createElement('div');
      el.innerHTML = html;

      return el.innerText;
    },
    { html },
  );
}

export { cleanHtml };
