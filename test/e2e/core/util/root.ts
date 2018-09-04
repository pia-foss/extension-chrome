const path = require('path');

function root(...filesOrDirs: string[]) {
  return path.resolve(__dirname, '..', '..', '..', '..', ...filesOrDirs);
}

export { root };
