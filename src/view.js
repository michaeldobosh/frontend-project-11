const elements = {
  form: document.querySelector('form'),
  input: document.querySelector('input'),
  button: document.querySelector('.h-100'),
  fieldOfFeedback: document.querySelector('.feedback'),
  posts: document.querySelector('.posts'),
  feeds: document.querySelector('.feeds'),

  renderFieldFeedback(state) {
    if (state.downloadStatus === 'success') {
      this.fieldOfFeedback.classList.add('text-success');
      this.fieldOfFeedback.classList.remove('text-danger');
      this.input.classList.add('is-valid');
      this.input.classList.remove('is-invalid');
      this.fieldOfFeedback.textContent = state.feedback;
    } else if (state.downloadStatus === 'error') {
      this.fieldOfFeedback.classList.add('text-danger');
      this.input.classList.add('is-invalid');
      this.fieldOfFeedback.textContent = state.feedback;
    }
  },

  renderModal(post) {
    const modalDiv = document.querySelector('#modal');
    const title = modalDiv.querySelector('h5');
    title.textContent = post.title;
    const description = modalDiv.querySelector('.text-break');
    description.textContent = post.description;
    const linkInModal = modalDiv.querySelector('.btn-primary');
    linkInModal.setAttribute('href', post.url);
  },

  markViewed(link) {
    link.classList.remove('fw-bold');
    link.classList.add('fw-normal');
    link.classList.add('link-secondary');
  },

  createPost(post, state, instance) {
    const list = document.createElement('ul');
    list.classList.add('list-group', 'border-0', 'rounded-0');
    list.addEventListener('click', () => {
      state.viewedPosts.add(post.postId);
      state.modal = post.postId;
    });

    const line = document.createElement('li');
    line.classList
      .add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');

    const link = document.createElement('a');
    link.classList.add('fw-bold');
    link.setAttribute('href', post.url);
    link.setAttribute('data-id', post.postId);
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
    link.textContent = post.title;

    const button = document.createElement('button');
    button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    button.setAttribute('type', 'button');
    button.setAttribute('data-id', post.postId);
    button.setAttribute('data-bs-toggle', 'modal');
    button.setAttribute('data-bs-target', '#modal');
    button.textContent = instance.t('view');

    line.append(link);
    line.append(button);
    list.append(line);

    if (state.modal === post.postId) {
      this.renderModal(post);
    }
    if (state.viewedPosts.has(post.postId)) {
      this.markViewed(link);
    }

    return list;
  },

  createFeed(feed) {
    const list = document.createElement('ul');
    list.classList.add('list-group', 'border-0', 'rounded-0');

    const line = document.createElement('li');
    line.classList.add('list-group-item', 'border-0', 'border-end-0');

    const title = document.createElement('h3');
    title.classList.add('h6', 'm-0');
    title.textContent = feed.title;

    const description = document.createElement('p');
    description.classList.add('m-0', 'small', 'text-black-50');
    description.textContent = feed.description;

    line.append(title);
    line.append(description);
    list.append(line);

    return list;
  },

  createLists(type) {
    const container = document.createElement('div');
    container.classList.add('card', 'border-0');

    const container2 = document.createElement('div');
    container2.classList.add('card-body');

    const title = document.createElement('h2');
    title.classList.add('card-title', 'h4');
    title.textContent = type;

    container2.append(title);
    container.append(container2);

    return container;
  },

  renderLists(state, instance) {
    const posts = state.loadedData.posts.map((post) => this.createPost(post, state, instance));
    const feeds = state.loadedData.feeds.map((feed) => this.createFeed(feed));

    const containerForPosts = this.createLists(instance.t('posts'));
    containerForPosts.append(...posts);
    const containerForFeeds = this.createLists(instance.t('feeds'));
    containerForFeeds.append(...feeds);

    if (this.posts.firstElementChild) {
      this.posts.firstElementChild.replaceWith(containerForPosts);
      this.feeds.firstElementChild.replaceWith(containerForFeeds);
    } else {
      this.posts.append(containerForPosts);
      this.feeds.append(containerForFeeds);
    }
  },
};

const render = (state, instance) => {
  if (state.formStatus === 'filling') {
    elements.button.disabled = false;
    elements.input.disabled = false;
  } else {
    elements.button.disabled = true;
    elements.input.disabled = true;
  }
  if (state.downloadStatus === 'success' || state.downloadStatus === 'error') {
    elements.renderFieldFeedback(state);
    elements.form.reset();
    elements.input.focus();
  }
  if (state.loadedData.posts.length > 0) {
    elements.renderLists(state, instance);
  }
  console.log(state.viewedPosts);
};

export default render;
