import * as yup from 'yup';
import keyBy from 'lodash/keyBy.js';
import i18next from 'i18next';
import resources from './locales/index.js';
import { elements, watchedState } from './view.js';
import loadeData from './handler.js';

const chekDuplicate = (value) => watchedState.loadedData.feeds.every(({ url }) => url !== value);

const searchRss = yup.object({
  currentUrl: yup.string().required('error_210').url('error_220')
    .test('isDuplicate', 'error_230', async (value) => {
      const isDuplicate = await chekDuplicate(value);
      return isDuplicate;
    }),
});

const validate = async (value) => {
  try {
    await searchRss.validate(value, { abortEarly: false });
    return {};
  } catch (e) {
    return keyBy(e.inner, 'path');
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

  const [input, button] = elements.form.elements;
  elements.form.addEventListener('submit', (evt) => {
    evt.preventDefault();

    watchedState.currentUrl = input.value;
    button.disabled = true;
    watchedState.status = 'request';

    const resultValidate = validate(watchedState);
    resultValidate
      .then((dataOfValidate) => {
        const [error] = Object.values(dataOfValidate);
        if (error) {
          watchedState.isValid = false;
          throw new Error(error.message);
        } else {
          watchedState.isValid = true;
        }
      })
      .then(() => loadeData(watchedState, instance))
      .catch((error) => {
        watchedState.feedback = instance.t(`${error.message}`);
        watchedState.status = 'error';
        button.disabled = false;
        input.focus();
      });
  });
};
