import axios from 'axios';
import _ from 'lodash';
import parse from './utils/parser.js';
import proxyUrl from './utils/proxyurl.js';

const updadeInterval = 5000;
const timeout = 8000;

const addDataToState = (state, data, currentUrl = null) => {
  const { feeds, posts } = state;
  const existingFeeds = feeds.map(({ title }) => title);
  const existingPosts = posts.map(({ title }) => title);

  data.forEach((parsedData) => {
    const { parsedFeed, parsedPosts } = parsedData;
    if (!existingFeeds.includes(parsedFeed.title)) {
      parsedFeed.url = currentUrl;
      parsedFeed.feedId = _.uniqueId();
      feeds.unshift(parsedFeed);
    }

    const filteredPosts = parsedPosts
      .filter(({ title }) => !existingPosts.includes(title))
      .map((post) => Object.assign(post, { postId: _.uniqueId() }));

    posts.unshift(...filteredPosts);
  });
};

const dataRequest = (state, currentUrl) => {
  const requestedData = axios.get(proxyUrl(currentUrl), { timeout });
  return Promise.resolve(requestedData)
    .then((responses) => [responses].map((data) => parse(data)))
    .then((data) => addDataToState(state, data, currentUrl))
    .catch((error) => {
      throw error;
    });
};

const dataUpdate = (state) => {
  const requestedData = state.feeds.map(({ url }) => axios.get(proxyUrl(url), { timeout }));
  return Promise.all(requestedData)
    .then((responses) => responses.map((data) => parse(data)))
    .then((data) => addDataToState(state, data))
    .then(() => setTimeout(() => dataUpdate(state), updadeInterval))
    .catch((error) => error);
};

export { dataRequest, dataUpdate };
