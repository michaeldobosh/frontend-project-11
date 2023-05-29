import '../index.html';
import './style.css';
import * as yup from 'yup';
// import _ from 'lodash';
import keyBy from 'lodash/keyBy.js';
// import axios from 'axios';
import { elements, watchedState } from './view.js';

const chekDuplicate = (value) => watchedState.dataForm.feeds.includes(value);

const userSchema = yup.object({
  currentUrl: yup.string().url('Ссылка должна быть валидным URL')
    .test('isDuplicate', 'RSS уже существует', async (value) => {
      const isDuplicate = await chekDuplicate(value);
      return !isDuplicate;
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

  const promise = validate(watchedState.dataForm);
  promise.then((dataOfValidate) => {
    const [error] = Object.values(dataOfValidate);
    if (error) {
      console.log(error.message);
      watchedState.error = error.message;
    } else {
      watchedState.dataForm.feeds.push(watchedState.dataForm.currentUrl);
      watchedState.error = null;
    }
  });

  console.log(watchedState);
  elements.form.reset();
  input.focus();
});
