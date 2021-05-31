/* eslint-disable
    func-names,
    no-bitwise,
    no-cond-assign,
    no-plusplus,
    no-useless-escape,
*/

exports.generateInstallId = function() {
    const S4 = () =>
      (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    return `${S4() + S4()}-${S4()}-${S4()}-${S4()}-${S4()}${S4()}${S4()}`;
  };
  
  exports.parseURL = function(url) {
    let needle;
    const urlNotation = /^([^:]+):\/\/([^\/:]*)(?::([\d]+))?(?:(\/[^#]*)(?:#(.*))?)?$/i;
    const match = url.match(urlNotation);
    if (!match) {
      return {};
    }
    return {
      scheme: match[1].toLowerCase(),
      host: match[2].toLowerCase(),
      port: match[3],
      path: match[4] || '/',
      fragment: match[5],
      local: ((needle = match[1].toLowerCase()),
      !['http', 'https'].includes(needle))
    };
  };
  
  // Fetch and concatenate all utm_* parameters from a given URL
  exports.getUTMSourcesFromURL = function(url) {
    let match;
    const { path } = exports.parseURL(url);
    const search = /[?&]([^=#]+)=([^&#]*)/g;
    const utmParams = [];
    while ((match = search.exec(path))) {
      // We push all parameters (key=value) that start with utm_ to an array
      if (match[1].indexOf('utm_') === 0) {
        utmParams.push(`${match[1]}=${match[2]}`);
      }
    }
    return utmParams.join(';'); // Concatenate array to string
  };
  
  // Concatenates two arrays with de-duplication
  // See: http://stackoverflow.com/a/24072887
  exports.concatUnique = (a, b) =>
    a.concat(b).filter((x, i, c) => c.indexOf(x) === i);
  
  // "YYYY-MM-DD HH:mm:ss [UTC]" is the format of the dates
  // but it also works with another formats :)
  exports.parseDate = function(s) {
    const date = new Date(s);
  
    if (isNaN(date.getTime())) {
      const [dateString, timeString] = s.split(' ');
      const dateParts = dateString.split('-');
      const timeParts = timeString.split(':');
      return new Date(
        dateParts[0],
        dateParts[1] - 1,
        dateParts[2],
        timeParts[0],
        timeParts[1],
        timeParts[2]
      );
    }
    return date;
  };
  
  // Shuffles the array with the Fisher-Yates algorithm (!!! not pure by design)
  exports.shuffle = function(things) {
    let currIndex = things.length;
    let tmpVal = null;
    let randomIndex = null;
  
    while (currIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currIndex);
      currIndex--;
  
      tmpVal = things[currIndex];
      things[currIndex] = things[randomIndex];
      things[randomIndex] = tmpVal;
    }
    return things;
  };
  
  // Chunks the array
  exports.chunk = function(arr, len) {
    len = len <= 0 ? 1 : len;
    const chunks = [];
    let i = 0;
    const n = arr.length;
    while (i < n) {
      chunks.push(arr.slice(i, (i += len)));
    }
    return chunks;
  };

  
  // Praise stackoverflow.com! (and Java™)
  exports.hashCode = val => {
    let hash = 0;
    if (!(typeof val === 'string')) {
      val = JSON.stringify(val);
    }
    if (!val || val.length === 0) {
      return hash;
    }
    for (let i = 0; i < val.length; i++) {
      const char = val.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash &= hash; // Convert to 32bit integer
    }
    return hash;
  };
  
  exports.hashString = val => exports.hashCode(val).toString();
  