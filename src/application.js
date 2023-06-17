import * as yup from 'yup';
import i18next from 'i18next';
import onChange from 'on-change';
import resources from './locales/index.js';
import render from './view.js';
import { isUniq } from './utils.js';
import downloadData from './handler.js';

const linkValidationCheck = yup.string()
  .required('empty_field').url('link_is_not_valid');
const checkForDuplicateLinks = yup.array()
  .test('isUniqUrls', 'rss_already_exists', (urls) => isUniq(urls));

const validate = async (state, currentUrl) => {
  const urls = state.loadedData.feeds.map(({ url }) => url);
  urls.push(currentUrl);

  try {
    await linkValidationCheck.validate(currentUrl, { abortEarly: false });
    await checkForDuplicateLinks.validate(urls, { abortEarly: false });
    return null;
  } catch (error) {
    return error.message;
  }
};

export default async () => {
  const defaultLang = 'ru';
  const instance = i18next.createInstance();
  await instance.init({
    lng: defaultLang,
    debug: false,
    resources,
  });

  const state = {
    validation: false,
    loadedData: {
      feeds: [],
      posts: [],
    },
    feedback: '',
    status: 'filling',
    modal: false,
    viewedPosts: [],
  };

  const form = document.querySelector('form');
  const watchedState = onChange(state, (path) => render(watchedState, instance, path));

  form.addEventListener('submit', (evt) => {
    evt.preventDefault();
    const formData = new FormData(evt.target);
    const currentUrl = formData.get('url');

    validate(watchedState, currentUrl)
      .then((error) => {
        if (error) {
          watchedState.validation = false;
          throw new Error(error);
        } else {
          watchedState.validation = true;
          watchedState.status = 'request';
        }
      })
      .then(() => downloadData(watchedState, currentUrl))
      .then((error) => {
        if (error.message === 'Network Error') {
          throw new Error('network_error');
        } else if (error.message === '[object HTMLUnknownElement]') {
          throw new Error('resource_does_not_contain_valid_rss');
        }
      })
      .then(() => {
        if (watchedState.status !== 'update') {
          watchedState.status = 'success';
          watchedState.feedback = instance.t('success');
          watchedState.status = 'update';
        }
      })
      .catch((error) => {
        watchedState.feedback = instance.t(`${error.message}`);
        watchedState.status = 'error';
        watchedState.status = 'update';
      });
  });
};
