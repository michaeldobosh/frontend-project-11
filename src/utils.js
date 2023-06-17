import _ from 'lodash';

const proxyUrl = (link) => {
  const url = new URL('https://allorigins.hexlet.app/get');
  url.searchParams.set('disableCache', true);
  url.searchParams.set('url', link);
  return url.toString();
};

const isUniq = (array) => array.length === _.union(array).length;

export { proxyUrl, isUniq };
