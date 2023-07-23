import * as yup from 'yup';
import { setLocale } from 'yup';
import i18next from 'i18next';
import onChange from 'on-change';
import resources from './locales/index.js';
import render from './view.js';
import downloadData from './download.js';

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
    isValidationForm: false,
    formStatus: 'filling',
    downloadStatus: 'notLoaded',
    loadedData: {
      feeds: [],
      posts: [],
    },
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
    const urls = watchedState.loadedData.feeds.map(({ url }) => url);
    watchedState.formStatus = 'sending';

    validate({ urls, currentUrl })
      .then((error) => {
        if (error) {
          watchedState.formStatus = 'filling';
          throw new Error(error);
        }
      })
      .then(() => {
        watchedState.downloadStatus = 'loading';
        return downloadData(watchedState, currentUrl);
      })
      .then((result) => {
        watchedState.formStatus = 'filling';
        let error;
        if (result) {
          error = `${result.message}`;
        }
        if (error === 'Network Error') {
          throw new Error('network_error');
        }
        if (error.substring(0, 11) === 'parsererror') {
          throw new Error('resource_does_not_contain_valid_rss');
        }
        watchedState.downloadStatus = 'success';
        watchedState.feedback = instance.t('success');
      })
      .catch((error) => {
        watchedState.downloadStatus = 'error';
        watchedState.feedback = instance.t(`${error.message}`);
      });
  });
};
