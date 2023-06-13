import * as yup from 'yup';
import keyBy from 'lodash/keyBy.js';
import { elements, watchedState } from './view.js';
import { loadeData, runApp } from './handler.js';

const instance = await runApp();

const chekDuplicate = (value) => watchedState.loadedData.feeds.every(({ url }) => url !== value);

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

export default () => {
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
      .then(() => loadeData(watchedState))
      .catch((error) => {
        watchedState.feedback = instance.t(`${error.message}`);
        watchedState.status = 'error';
        button.disabled = false;
        input.focus();
      });
  });
};
