import { URL } from 'url';

interface Param {
  key: string;
  value: string;
}

const PIA_URL = 'https://www.privateinternetaccess.com';

/**
 * Base URL for PIA website
 */
exports.PIA_URL = PIA_URL;

/**
 * Build url for PIA website
 *
 * @param {string} pathname Path for URL
 * @param {Param[]} [params] Query parameters for URL
 *
 * @returns {string} Created URL
 */
const createPiaUrl = (pathname = '', params = [] as Param[]) => {
  const url = new URL(PIA_URL);
  url.pathname = pathname;
  params.forEach(({ key, value }) => {
    return url.searchParams.set(key, value);
  });

  return url.toString();
};

export { createPiaUrl };
