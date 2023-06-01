import '../index.html';
import './style.css';
import * as yup from 'yup';
// import _ from 'lodash';
import keyBy from 'lodash/keyBy.js';
import axios from 'axios';
import i18next from 'i18next';
import { elements, watchedState } from './view.js';
import resources from './resources.js';

const parsing = (rss) => {
  const parser = new DOMParser();
  return parser.parseFromString(rss, 'application/xml');
};

const instance = i18next.createInstance();

instance.init({
  lng: 'ru',
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
  const [input] = elements.form.elements;
  watchedState.dataForm.currentUrl = input.value;

  const resultValidate = validate(watchedState.dataForm);
  resultValidate.then((dataOfValidate) => {
    const [error] = Object.values(dataOfValidate);
    if (error) {
      console.log(dataOfValidate);
      watchedState.feedback = error.message;
      watchedState.status = 1;
    } else {
      axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(watchedState.dataForm.currentUrl)}`)
        .then((response) => {
          const data = parsing(response.data.contents);
          const titleFeed = data.querySelector('title').textContent;
          const descriptionFeed = data.querySelector('description').textContent;
          data.querySelectorAll('item').forEach((item) => {
            watchedState.dataForm.posts.push({
              url: item.children[2].textContent,
              title: item.firstElementChild.textContent,
              description: item.children[3].textContent,
            });
          });
          watchedState.dataForm.feeds.push({
            url: watchedState.dataForm.currentUrl,
            title: titleFeed,
            description: descriptionFeed,
          });
          watchedState.feedback = instance.t('succes');
          watchedState.status = response.status;
        });
    }
  });

  console.log(watchedState);
  elements.form.reset();
  input.focus();
});
