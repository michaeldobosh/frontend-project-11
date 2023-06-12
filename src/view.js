import onChange from 'on-change';

const elements = {
  form: document.querySelector('form'),
  fieldOfFeedback: document.querySelector('.feedback'),
  makeFieldSucces(state) {
    const [input] = this.form.elements;
    this.fieldOfFeedback.classList.add('text-success');
    this.fieldOfFeedback.classList.remove('text-danger');
    input.classList.add('is-valid');
    input.classList.remove('is-invalid');
    this.fieldOfFeedback.textContent = state.feedback;
  },

  makeFieldError(state) {
    const [input] = this.form.elements;
    this.fieldOfFeedback.classList.add('text-danger');
    input.classList.add('is-invalid');
    this.fieldOfFeedback.textContent = state.feedback;
  },

  makeModal(post) {
    const modalDiv = document.querySelector('#modal');
    const title = modalDiv.querySelector('h5');
    title.textContent = post.title;
    const description = modalDiv.querySelector('.text-break');
    description.textContent = post.description;
    const linkInModal = modalDiv.querySelector('.btn-primary');
    linkInModal.setAttribute('href', post.url);
  },

  makeViewed(post) {
    const linkPost = document.querySelector(`[data-id="${post.postId}"]`);
    linkPost.classList.remove('fw-bold');
    linkPost.classList.add('fw-normal');
    linkPost.classList.add('link-secondary');
  },

  makePost(post, state) {
    const ul = document.querySelector('.posts div ul');
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
    li.innerHTML = `<a href="${post.url}" class="fw-bold" data-id="2" target="_blank" rel="noopener noreferrer">${post.title}</a>
    <button type="button" class="btn btn-outline-primary btn-sm" data-id="2" data-bs-toggle="modal" data-bs-target="#modal">Просмотр</button>`;
    ul.append(li);
    const button = li.querySelector('.btn');
    button.dataset.id = post.postId;

    button.addEventListener('click', () => {
      state.modal = post.postId;
      state.viewed.push(post.postId);
    });
    const linkPost = li.querySelector('[data-id]');
    linkPost.dataset.id = post.postId;
    linkPost.addEventListener('click', () => {
      state.viewed.push(post.postId);
    });

    if (state.modal === post.postId) {
      elements.makeModal(post);
    }
    if (state.viewed.includes(post.postId)) {
      elements.makeViewed(post);
    }

    return li.firstElementChild;
  },

  makeFeed(state) {
    const ul = document.querySelector('.feeds div ul');
    const li = document.createElement('li');
    li.innerHTML = `<li class="list-group-item border-0 border-end-0">
      <h3 class="h6 m-0">${state.title}</h3>
      <p class="m-0 small text-black-50">${state.description}</p></li>`;
    ul.append(li);
  },

  makeLists(state) {
    const posts = document.querySelector('.posts');
    const feeds = document.querySelector('.feeds');
    posts.innerHTML = `<div class="card border-0"><div class="card-body"><h2 class="card-title h4">Посты</h2></div>
      <ul class="list-group border-0 rounded-0"></ul></div>`;
    feeds.innerHTML = `<div class="card border-0">
    <div class="card-body"><h2 class="card-title h4">Фиды</h2></div>
    <ul class="list-group border-0 rounded-0">
    </ul>
    </div>`;

    state.loadedData.posts.forEach((post) => this.makePost(post, state));
    state.loadedData.feeds.forEach((feed) => elements.makeFeed(feed));
  },
};

const render = (state) => {
  if (state.status === 200) {
    elements.makeFieldSucces(state);
  } else if (state.status === 'error') {
    elements.makeFieldError(state);
  }
  if (state.loadedData.posts.length > 0) {
    elements.makeLists(state);
  }
};

const state = {
  currentUrl: '',
  loadedData: {
    feeds: [],
    posts: [],
  },
  feedback: '',
  status: 'filling',
  modal: false,
  viewed: [],
};

const watchedState = onChange(state, (path) => render(watchedState, elements.form, path));

export { elements, watchedState };
