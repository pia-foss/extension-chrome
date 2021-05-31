const FOREGROUND = 'foreground';
const BACKGROUND = 'background';

class Courier {
  constructor() {
    this.id = BACKGROUND;
    this.target = FOREGROUND;

    this.sendMesage = this.sendMessage.bind(this);
    this.receiveMessage = this.receiveMessage.bind(this);

    // handle listener
    if(typeof browser == 'undefined'){
      chrome.runtime.onMessage.addListener(this.receiveMessage);
    }else{
      browser.runtime.onMessage.addListener(this.receiveMessage);
    }
  }

  async sendMessage(type, data) {
    const msg = { type, target: this.target, data: data || {} };
    return chrome.runtime.sendMessage(msg);
  }

  receiveMessage(message, sender, response) {
    if (message.target !== this.id) { return false; }

    new Promise((resolve) => {
      // do some work
      return resolve({ data: 'message received on background' });
    })
      .then(response)
      .catch(() => { return response(false); });

    // must return true here to keep the response callback alive
    return true;
  }
}

export default Courier;
