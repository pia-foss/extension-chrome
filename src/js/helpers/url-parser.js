class UrlParser {
    constructor() {
        this.parse = this.parse.bind(this);
    }

    parse(url) {
      const match = url.match(/^(http|https|ftp)?(?:[\:\/]*)([a-z0-9\.-]*)(?:\:([0-9]+))?(\/[^?#]*)?(?:\?([^#]*))?(?:#(.*))?$/i);
      const ret = {
        protocol: '',
        host: '',
        port: '',
        path: '',
        query: '',
        fragment: '',
        domain: '',
        subdomain: ''
      };
      if (!match) {
        return ret;
      }
      if (match[1]) {
        ret.protocol = match[1];
      }
      if (match[2]) {
        ret.host = match[2];
      }
      if (match[3]) {
        ret.port = match[3];
      }
  
      if (match[4]) {
        ret.path = match[4];
      }
  
      if (match[5]) {
        ret.query = match[5];
      }
  
      if (match[6]) {
        ret.fragment = match[6];
      }
      if (ret.host) {
        const splitDomanin = match[2].split('.');
        if (splitDomanin.length == 3) {
          ret.domain = splitDomanin[1] + '.' + splitDomanin[2];
          ret.subdomain = splitDomanin[0];
        } else {
          ret.domain = splitDomanin[0] + '.' + splitDomanin[1];
        }
      }
      return ret;
    }

  }

  export default UrlParser;
  