import onChange from 'on-change';

const render = (state, form) => {
  const [input] = form.elements;
  const errorElement = document.querySelector('.text-danger');
  if (state.error !== null) {
    input.classList.add('is-invalid');
    errorElement.textContent = state.error;
  } else {
    errorElement.textContent = '';
    input.classList.remove('is-invalid');
  }
};

const state = {
  dataForm: {
    currentUrl: '',
    feeds: [],
  },
  error: null,
};

const elements = {
  form: document.querySelector('form'),
};

const watchedState = onChange(state, (path) => render(watchedState, elements.form));

export { elements, watchedState };
