import '../index.html';
import './style.css';
import * as yup from 'yup';
// import _ from 'lodash';
import keyBy from 'lodash/keyBy.js';
import axios from 'axios';
import i18next from 'i18next';
import { elements, watchedState } from './view.js';
import { parsing, setIntervalCheck } from './utils.js';
import resources from './resources.js';

const instance = i18next.createInstance();
const defaultLang = 'ru';
instance.init({
  lng: defaultLang,
  resources,
});

const chekDuplicate = (value) => watchedState.dataForm.feeds.every(({ url }) => url !== value);

const userSchema = yup.object({
  currentUrl: yup.string().url(instance.t('invalidUrl'))
    .test('isDuplicate', instance.t('haveThisRss'), async (value) => {
      const isDuplicate = await chekDuplicate(value);
      return isDuplicate;
    }),
});

const validate = async (value) => {
  try {
    await userSchema.validate(value, { abortEarly: false });
    return {};
  } catch (e) {
    return keyBy(e.inner, 'path');
  }
};

elements.form.addEventListener('submit', (evt) => {
  evt.preventDefault();
  const [input, button] = elements.form.elements;
  watchedState.dataForm.currentUrl = input.value;

  const resultValidate = validate(watchedState.dataForm);
  resultValidate.then((dataOfValidate) => {
    const [error] = Object.values(dataOfValidate);
    if (error) {
      watchedState.feedback = error.message;
      watchedState.status = 0;
      return;
    }
    button.disabled = true;
    axios
      .get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(watchedState.dataForm.currentUrl)}`)
      .then((response) => {
        elements.form.reset();
        input.focus();
        const rssData = parsing(response.data.contents);
        const titleFeed = rssData.querySelector('title').textContent;
        const descriptionFeed = rssData.querySelector('description').textContent;
        watchedState.dataForm.feeds.push({
          url: watchedState.dataForm.currentUrl,
          title: titleFeed,
          description: descriptionFeed,
        });
        rssData.querySelectorAll('item').forEach((post) => {
          watchedState.dataForm.posts.push({
            url: post.querySelector('link').textContent,
            title: post.querySelector('title').textContent,
            description: post.querySelector('description').textContent,
            viewed: false,
            modal: false,
          });
        });
        watchedState.feedback = instance.t('succes');
        watchedState.status = response.status;
        button.disabled = false;
        setIntervalCheck(watchedState);
      })
      .catch(() => {
        watchedState.status = 0;
        watchedState.feedback = instance.t('failure');
        button.disabled = false;
      });
  });
});
