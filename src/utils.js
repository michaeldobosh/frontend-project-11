const proxyUrl = (link) => {
  const url = new URL('https://allorigins.hexlet.app/get');
  url.searchParams.set('disableCache', true);
  url.searchParams.set('url', link);
  return url.toString();
};

export default proxyUrl;
