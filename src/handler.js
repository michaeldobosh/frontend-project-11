import axios from 'axios';
import _ from 'lodash';
import parse from './parser.js';
import { proxyUrl } from './utils.js';

const downloadData = (state, currentUrl) => {
  const { feeds, posts } = state.loadedData;
  const existingUrls = feeds.map(({ url }) => url);
  const existingFeeds = feeds.map(({ title }) => title);
  const existingPosts = posts.map(({ title }) => title);

  if (state.validation) existingUrls.push(currentUrl);
  console.log(state.status);
  return Promise.all(_.union(existingUrls).map((url) => axios.get(proxyUrl(url))))
    .then((responses) => parse(responses))
    .then((parseredData) => {
      if (parseredData.name === 'Error') {
        throw new Error(parseredData.message);
      }

      const filteredFeeds = parseredData.feeds
        .filter(({ title }) => !existingFeeds.includes(title))
        .map((feed) => Object.assign(feed, { url: currentUrl, feedId: _.uniqueId() }));
      const filteredPosts = parseredData.posts
        .filter(({ title }) => !existingPosts.includes(title))
        .map((post) => Object.assign(post, { postId: _.uniqueId() }));

      feeds.unshift(...filteredFeeds);
      posts.unshift(...filteredPosts);
    })
    .then(() => setTimeout(() => downloadData(state, currentUrl), 5000))
    .catch((error) => error);
};

export default downloadData;
