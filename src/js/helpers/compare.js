const ERROR = 'ERROR';
const PENDING = 'PENDING';

function byLatency(a, b) {
  if (a < 0) { return 1; }
  if (b < 0) { return -1; }
  if (a === ERROR) { return 1; }
  if (b === ERROR) { return -1; }
  if (a === PENDING) { return 1; }
  if (b === PENDING) { return -1; }
  return a - b;
}

export { byLatency };
