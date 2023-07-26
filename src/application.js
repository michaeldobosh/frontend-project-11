import * as yup from 'yup';
import { setLocale } from 'yup';
import i18next from 'i18next';
import onChange from 'on-change';
import resources from './locales/index.js';
import render from './view.js';
import { dataRequest, dataUpdate } from './aggregator.js';

setLocale({
  mixed: {
    default: 'field_invalid',
    required: 'empty_field',
    notOneOf: 'rss_already_exists',
  },
  string: {
    url: 'link_is_not_valid',
  },
});

const validateUrl = (urls) => yup.object({
  currentUrl: yup.string().required().url().notOneOf(urls),
});

const validate = async ({ urls, currentUrl }) => {
  try {
    await validateUrl(urls).validate({ currentUrl }, { abortEarly: false });
    return null;
  } catch (error) {
    return error;
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
    feeds: [],
    posts: [],
    formStatus: 'filling',
    downloadStatus: 'notLoaded',
    feedback: '',
    modal: false,
    viewedPosts: new Set([]),
  };

  const form = document.querySelector('form');
  const watchedState = onChange(state, (path) => render(watchedState, instance, path));

  form.addEventListener('submit', (evt) => {
    evt.preventDefault();
    const formData = new FormData(evt.target);
    const currentUrl = formData.get('url');
    const urls = watchedState.feeds.map(({ url }) => url);
    watchedState.formStatus = 'sending';

    validate({ urls, currentUrl })
      .then((error) => {
        if (error) {
          const validationError = new Error(error);
          validationError.code = error.message;
          throw validationError;
        }
      })
      .then(() => {
        watchedState.downloadStatus = 'loading';
        return dataRequest(watchedState, currentUrl);
      })
      .then(() => {
        watchedState.formStatus = 'sent';
        watchedState.downloadStatus = 'success';
        watchedState.feedback = instance.t('success');
      })
      .then(() => dataUpdate(watchedState))
      .then(() => {
        watchedState.downloadStatus = 'update';
      })
      .catch((error) => {
        watchedState.formStatus = 'sent';
        watchedState.downloadStatus = 'error';
        watchedState.feedback = instance.t(error.code);
      });
  });
};
