/**
 * determine if extension running in devmode or not
 *
 * @return {boolean}
 */
function isDev() {
  return process.env.NODE_ENV === 'development';
}

export default isDev;
