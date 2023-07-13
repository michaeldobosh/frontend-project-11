import axios from 'axios';
import _ from 'lodash';
import parse from './parser.js';
import { proxyUrl } from './utils.js';

const downloadData = (state, currentUrl) => {
  const { feeds, posts } = state.loadedData;
  const existingUrls = feeds.map(({ url }) => url);
  const existingFeeds = feeds.map(({ title }) => title);
  const existingPosts = posts.map(({ title }) => title);

  if (state.isValidatedForm) existingUrls.push(currentUrl);
  return Promise.all(_.union(existingUrls).map((url) => axios.get(proxyUrl(url))))
    .then((responses) => responses.map((data) => parse(data)))
    .then((parsedData) => {
      if (parsedData.at(-1).tagName === 'parsererror') {
        const parserError = new Error(parsedData.at(-1).textContent);
        parserError.name = 'parsererror';
        throw parserError;
      }

      parsedData.forEach(({ parsedFeed, parsedPosts }) => {
        if (!existingFeeds.includes(parsedFeed.title)) {
          const feed = Object.assign(parsedFeed, { url: currentUrl, feedId: _.uniqueId() });
          feeds.unshift(feed);
        }

        const filteredPosts = parsedPosts
          .filter(({ title }) => !existingPosts.includes(title))
          .map((post) => Object.assign(post, { postId: _.uniqueId() }));

        posts.unshift(...filteredPosts);
      });
    })
    .then(() => setTimeout(() => downloadData(state, currentUrl), 5000))
    .catch((error) => error);
};

export default downloadData;
