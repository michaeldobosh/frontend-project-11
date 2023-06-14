import axios from 'axios';
import _ from 'lodash';
import { elements } from './view.js';
import { parser, fetchProxyUrl } from './utils.js';

const [input, button] = elements.form.elements;

const parse = (data, state, instance) => Promise.resolve(data)
  .then((responses) => responses.map((response) => parser
    .parseFromString(response.data.contents, 'application/xml')))
  .then((loadedData) => loadedData.reduce((acc, rssData) => {
    const error = rssData.querySelector('parsererror');
    if (error) {
      error.message = 'parsing failed';
      throw new Error(error.message);
    }

    const currentTitleFeeds = state.loadedData.feeds.map(({ title }) => title);
    const currentTitlePosts = state.loadedData.posts.map(({ title }) => title);

    const feedTitle = rssData.querySelector('title');
    const feedDescription = rssData.querySelector('description');
    const items = [...rssData.querySelectorAll('item')];

    const feeds = currentTitleFeeds.includes(feedTitle.textContent) ? [] : [{
      url: state.currentUrl,
      title: feedTitle.textContent,
      description: feedDescription.textContent,
    }];

    const posts = items
      .filter((post) => {
        const postTitle = post.querySelector('title');
        return !currentTitlePosts.includes(postTitle.textContent);
      })
      .map((post) => {
        const postLink = post.querySelector('link');
        const postTitle = post.querySelector('title');
        const postDescription = post.querySelector('description');

        return {
          url: postLink.textContent,
          title: postTitle.textContent,
          description: postDescription.textContent,
        };
      });

    acc.feeds.push(...feeds);
    acc.posts.push(...posts);
    return acc;
  }, { feeds: [], posts: [] }))
  .catch((error) => {
    if (error.message === 'parsing failed') {
      state.feedback = instance.t('error_250');
      state.status = 'error';
    }
  });

const loadeData = (state, instance) => {
  const urls = state.loadedData.feeds.map(({ url }) => url);
  if (state.isValid) urls.push(state.currentUrl);
  Promise.all(_.union(urls).map((url) => axios.get(fetchProxyUrl(url))))
    .then((responses) => parse(responses, state, instance))
    .then(({ feeds, posts }) => {
      feeds.forEach((feed) => {
        feed.feedId = _.uniqueId();
        state.loadedData.feeds.unshift(feed);
      });
      posts.forEach((post) => {
        post.postId = _.uniqueId();
        state.loadedData.posts.unshift(post);
      });
    })
    .then(() => {
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
      input.focus();
    });
};

export default loadeData;
