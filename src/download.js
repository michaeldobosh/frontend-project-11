import axios from 'axios';
import _ from 'lodash';
import parse from './parser.js';
import proxyUrl from './utils.js';

const updadeInterval = 5000;

const downloadData = (state, currentUrl, timer = null) => {
  if (state.downloadStatus === 'loading') {
    clearTimeout(timer);
  }

  return Promise.all([currentUrl].flat().map((url) => axios.get(proxyUrl(url))))
    .then((responses) => responses.map((data) => parse(data)))
    .then((data) => {
      const [error] = data.filter((parsedData) => typeof parsedData === 'string');
      if (error) {
        throw new Error(error);
      }
      const { feeds, posts } = state.loadedData;
      const existingFeeds = feeds.map(({ title }) => title);
      const existingPosts = posts.map(({ title }) => title);

      data.forEach((parsedData) => {
        const { parsedFeed, parsedPosts } = parsedData;
        if (state.downloadStatus === 'loading') {
          if (!existingFeeds.includes(parsedFeed.title)) {
            parsedFeed.url = currentUrl;
            parsedFeed.feedId = _.uniqueId();
            feeds.unshift(parsedFeed);
          }
        }

        const filteredPosts = parsedPosts
          .filter(({ title }) => !existingPosts.includes(title))
          .map((post) => Object.assign(post, { postId: _.uniqueId() }));

        posts.unshift(...filteredPosts);
      });
      const existingUrls = feeds.map(({ url }) => url);
      return existingUrls;
    })
    .then((existingUrls) => {
      const timerId = setTimeout(() => downloadData(state, existingUrls, timerId), updadeInterval);
      return timerId;
    })
    .catch((error) => error);
};

export default downloadData;
