import * as yup from 'yup';
import { setLocale } from 'yup';
import i18next from 'i18next';
import onChange from 'on-change';
import resources from './locales/index.js';
import render from './view.js';
import { isUniq } from './utils.js';
import downloadData from './handler.js';

setLocale({
  mixed: {
    default: 'field_invalid',
    required: 'empty_field',
  },
  string: {
    url: 'link_is_not_valid',
  },
});

const validateSchema = yup.object({
  urls: yup.array()
    .test('isUniqUrls', 'rss_already_exists', (urls) => isUniq(urls)),
  currentUrl: yup.string().required().url(),
});

const validate = async ({ urls, currentUrl }) => {
  try {
    await validateSchema.validate({ urls, currentUrl }, { abortEarly: false });
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
    isValidatedForm: false,
    formStatus: 'filling',
    downloadStatus: null,
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
    console.log(state.viewedPosts);
    evt.preventDefault();
    const formData = new FormData(evt.target);
    const currentUrl = formData.get('url');
    const urls = watchedState.loadedData.feeds.map(({ url }) => url)
      .concat([currentUrl]);

    validate({ urls, currentUrl })
      .then((error) => {
        if (error) {
          watchedState.isValidatedForm = false;
          throw new Error(error);
        } else {
          watchedState.isValidatedForm = true;
          watchedState.formStatus = 'sending';
          watchedState.downloadStatus = 'request';
        }
      })
      .then(() => downloadData(watchedState, currentUrl))
      .then((error) => {
        watchedState.formStatus = 'filling';
        if (error.message === 'Network Error') {
          throw new Error('network_error');
        } else if (error.name === 'parsererror') {
          throw new Error('resource_does_not_contain_valid_rss');
        }
        if (watchedState.downloadStatus !== 'update') {
          watchedState.downloadStatus = 'success';
          watchedState.feedback = instance.t('success');
          watchedState.downloadStatus = 'update';
        }
      })
      .catch((error) => {
        watchedState.feedback = instance.t(`${error.message}`);
        watchedState.downloadStatus = 'error';
        watchedState.downloadStatus = 'update';
      });
  });
};
