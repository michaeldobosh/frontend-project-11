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

  makePost(post, state) {
    const ul = document.querySelector('.posts div ul');
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
    li.innerHTML = `<a href="${post.url}" class="fw-bold" data-id="2" target="_blank" rel="noopener noreferrer">${post.title}</a>
    <button type="button" class="btn btn-outline-primary btn-sm" data-id="2" data-bs-toggle="modal" data-bs-target="#modal">Просмотр</button>`;
    ul.append(li);
    const button = li.querySelector('.btn');
    button.addEventListener('click', () => {
      post.viewed = true;
      post.modal = true;
      console.log(state);
    });
    return li.firstElementChild;
  },

  makeFeed(title, description) {
    const ul = document.querySelector('.feeds div ul');
    const li = document.createElement('li');
    li.innerHTML = `<li class="list-group-item border-0 border-end-0">
      <h3 class="h6 m-0">${title}</h3><p class="m-0 small text-black-50">${description}</p></li>`;
    ul.append(li);
  },

  makeModal(post) {
    document.body.classList.add('modal-open');
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = '17px';

    const modalDiv = document.querySelector('#modal');
    modalDiv.classList.add('show');
    modalDiv.style.display = 'block';
    modalDiv.setAttribute('aria-modal', true);
    modalDiv.removeAttribute('aria-hidden');

    const title = modalDiv.querySelector('h5');
    title.textContent = post.title;
    const description = modalDiv.querySelector('.text-break');
    description.textContent = post.description;
    const link = modalDiv.querySelector('.btn-primary');
    link.setAttribute('href', post.url);
    const divFooter = document.createElement('div');
    divFooter.classList.add('modal-backdrop', 'fade', 'show');

    document.body.append(divFooter);

    const closeButtons = modalDiv.querySelectorAll('[data-bs-dismiss="modal"]');
    closeButtons.forEach((close) => {
      close.addEventListener('click', () => {
        post.modal = false;
        document.body.classList.remove('modal-open');
        document.body.style.removeProperty('overflow');
        document.body.style.removeProperty('padding-right');

        modalDiv.classList.remove('show');
        modalDiv.style.display = 'none';
        modalDiv.setAttribute('aria-hidden', true);
        modalDiv.removeAttribute('aria-modal');
        divFooter.remove();
      });
    });
  },
};

const render = (state, form) => {
  const { dataForm, feedback, status } = state;
  const [input] = form.elements;
  const errorElement = document.querySelector('.feedback');
  if (status === 200) {
    errorElement.classList.add('text-success');
    errorElement.classList.remove('text-danger');
    input.classList.add('is-valid');
    input.classList.remove('is-invalid');
    errorElement.textContent = feedback;
    elements.makeLists();
    dataForm.posts.forEach((post) => {
      const titlePost = elements.makePost(post, state);
      if (post.viewed) {
        titlePost.classList.remove('fw-bold');
        titlePost.classList.add('fw-normal');
      }
      if (post.modal) {
        elements.makeModal(post);
      }
    });
    dataForm.feeds.forEach(({ title, description }) => elements.makeFeed(title, description));
  } else if (status === 0) {
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
