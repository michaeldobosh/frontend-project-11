import '../index.html';
import './style.css';
import * as yup from 'yup';
import keyBy from 'lodash/keyBy.js';
import i18next from 'i18next';
import { elements, watchedState } from './view.js';
import resources from './resources.js';
import {
  parsing,
  setIntervalCheck,
  request,
  writePost,
} from './utils.js';

const instance = i18next.createInstance();
const defaultLang = 'ru';
instance.init({
  lng: defaultLang,
  resources,
});

const chekDuplicate = (value) => watchedState.dataForm.feeds.every(({ url }) => url !== value);

const userSchema = yup.object({
  currentUrl: yup.string().required('error_210').url('error_220')
    .test('isDuplicate', 'error_230', async (value) => {
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
  let reply;

  const resultValidate = validate(watchedState.dataForm);
  resultValidate
    .then((dataOfValidate) => {
      const [error] = Object.values(dataOfValidate);
      if (error) throw new Error(error.message);
    })
    .then(() => {
      button.disabled = true;
      return request(watchedState.dataForm.currentUrl);
    })
    .then((response) => {
      button.disabled = false;
      watchedState.feedback = instance.t('succes');
      reply = response.status;
      return parsing(response.data.contents);
    })
    .then((rssData) => {
      const titleFeed = rssData.querySelector('title').textContent;
      const descriptionFeed = rssData.querySelector('description').textContent;
      watchedState.dataForm.feeds.push({
        url: watchedState.dataForm.currentUrl,
        title: titleFeed,
        description: descriptionFeed,
      });
      writePost(rssData, watchedState);
      setIntervalCheck(watchedState);
      elements.form.reset();
      input.focus();
      watchedState.status = reply;
    })
    .catch((error) => {
      if (error.message.slice(0, 6) === 'error_') {
        watchedState.feedback = instance.t(`${error.message}`);
      } else if (error.message === 'Network Error') {
        watchedState.feedback = instance.t('error_240');
      } else {
        watchedState.feedback = instance.t('error_250');
      }
      console.log(error.message);
      watchedState.status = 'error';
      button.disabled = false;
    });
});
