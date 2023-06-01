import onChange from 'on-change';

const elements = {
  form: document.querySelector('form'),
  makeLists() {
    const posts = document.querySelector('.posts');
    const feeds = document.querySelector('.feeds');
    posts.innerHTML = `<div class="card border-0"><div class="card-body"><h2 class="card-title h4">Посты</h2></div>
      <ul class="list-group border-0 rounded-0"></ul></div>`;
    feeds.innerHTML = `<div class="card border-0">
    <div class="card-body"><h2 class="card-title h4">Фиды</h2></div>
    <ul class="list-group border-0 rounded-0">
    </ul>
  </div>`;
  },
  makePost(url, title) {
    const ul = document.querySelector('.posts div ul');
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
    li.innerHTML = `<a href="${url}" class="fw-bold" data-id="2" target="_blank" rel="noopener noreferrer">${title}</a>
    <button type="button" class="btn btn-outline-primary btn-sm" data-id="2" data-bs-toggle="modal" data-bs-target="#modal">Просмотр</button>`;
    ul.append(li);
  },
  makeFeed(title, description) {
    const ul = document.querySelector('.feeds div ul');
    const li = document.createElement('li');
    li.innerHTML = `<li class="list-group-item border-0 border-end-0">
      <h3 class="h6 m-0">${title}</h3><p class="m-0 small text-black-50">${description}</p></li>`;
    ul.append(li);
  },
};

const render = ({ dataForm, feedback, status }, form) => {
  const [input] = form.elements;
  const errorElement = document.querySelector('.feedback');
  if (status === 200) {
    errorElement.classList.add('text-success');
    errorElement.classList.remove('text-danger');
    input.classList.add('is-valid');
    input.classList.remove('is-invalid');
    errorElement.textContent = feedback;
    elements.makeLists();
    dataForm.posts.forEach(({ url, title }) => elements.makePost(url, title));
    dataForm.feeds.forEach(({ title, description }) => elements.makeFeed(title, description));
  } else if (status === 1) {
    errorElement.classList.add('text-danger');
    input.classList.add('is-invalid');
    errorElement.textContent = feedback;
  }
};

const state = {
  dataForm: {
    currentUrl: '',
    posts: [],
    feeds: [],
  },
  feedback: '',
  status: null,
};

const watchedState = onChange(state, (path) => render(watchedState, elements.form, path));

export { elements, watchedState };
