import axios from 'axios';
import i18next from 'i18next';
import _ from 'lodash';
import resources from './locales/index.js';
import { elements } from './view.js';

const instance = i18next.createInstance();
const defaultLang = 'ru';
instance.init({
  lng: defaultLang,
  debug: false,
  resources,
});

const parser = new DOMParser();
const [input, button] = elements.form.elements;

const request = (url) => {
  const proxyUrl = new URL('https://allorigins.hexlet.app/get');
  proxyUrl.searchParams.set('disableCache', true);
  proxyUrl.searchParams.set('url', url);
  return axios.get(proxyUrl.toString());
};

const parse = (data, state) => Promise.resolve(data)
  .then((responses) => responses.map((response) => parser
    .parseFromString(response.data.contents, 'application/xml')))
  .then((loadedData) => loadedData.reduce((acc, rssData) => {
    const currentTitleFeeds = state.loadedData.feeds.map(({ title }) => title);
    const currentTitlePosts = state.loadedData.posts.map(({ title }) => title);

    const loadedFeed = rssData.querySelector('title').textContent;
    const feeds = currentTitleFeeds.includes(loadedFeed) ? [] : [{
      feedId: _.uniqueId(),
      url: state.currentUrl,
      title: rssData.querySelector('title').textContent,
      description: rssData.querySelector('description').textContent,
    }];

    const posts = [...rssData.querySelectorAll('item')]
      .filter((post) => !currentTitlePosts.includes(post.querySelector('title').textContent))
      .map((post) => (
        {
          postId: _.uniqueId(),
          url: post.querySelector('link').textContent,
          title: post.querySelector('title').textContent,
          description: post.querySelector('description').textContent,
        }
      ));

    acc.feeds.push(...feeds);
    acc.posts.push(...posts);
    return acc;
  }, { feeds: [], posts: [] }))
  .catch(() => {
    state.feedback = instance.t('error_250');
    state.status = 'error';
  });

const loadeData = (state) => {
  const urls = state.loadedData.feeds.map(({ url }) => url);
  if (state.isValid) urls.push(state.currentUrl);
  Promise.all(_.union(urls).map((url) => request(url)))
    .then((responses) => parse(responses, state))
    .then(({ feeds, posts }) => {
      state.loadedData.feeds.unshift(...feeds);
      state.loadedData.posts.unshift(...posts);
      if (state.status === 'request') {
        elements.form.reset();
        input.focus();
        button.disabled = false;
        state.feedback = instance.t('succes');
        state.status = 200;
      }
    })
    .then(() => {
      state.status = 'update';
      return setTimeout(() => loadeData(state), 5000);
    })
    .catch((error) => {
      if (error.message === 'Network Error') {
        state.feedback = instance.t('error_240');
      }
      state.status = 'error';
      button.disabled = false;
    });
};

export default loadeData;
