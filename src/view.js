const elements = {
  form: document.querySelector('form'),
  input: document.querySelector('input'),
  button: document.querySelector('.h-100'),

  createElementsContainer(header) {
    const container = document.createElement('div');
    container.classList.add('card', 'border-0');

    const container2 = document.createElement('div');
    container2.classList.add('card-body');

    const list = document.createElement('ul');
    list.classList.add('list-group', 'border-0', 'rounded-0');

    const title = document.createElement('h2');
    title.classList.add('card-title', 'h4');
    title.textContent = header;

    container2.append(title);
    container.append(container2);
    container.append(list);

    return container;
  },

  renderQueryResult({ downloadStatus, feedback }) {
    const fieldOfFeedback = document.querySelector('.feedback');
    if (downloadStatus === 'success') {
      fieldOfFeedback.classList.add('text-success');
      fieldOfFeedback.classList.remove('text-danger');
      fieldOfFeedback.textContent = feedback;
      this.input.classList.add('is-valid');
      this.input.classList.remove('is-invalid');
    } else if (downloadStatus === 'error') {
      fieldOfFeedback.classList.add('text-danger');
      fieldOfFeedback.textContent = feedback;
      this.input.classList.add('is-invalid');
    }
  },

  renderModalWindow(state) {
    const [openedPost] = state.posts.filter(({ postId }) => postId === state.modal);
    if (openedPost) {
      const modalDiv = document.querySelector('#modal');
      const title = modalDiv.querySelector('h5');
      title.textContent = openedPost.title;
      const description = modalDiv.querySelector('.text-break');
      description.textContent = openedPost.description;
      const linkInModal = modalDiv.querySelector('.btn-primary');
      linkInModal.setAttribute('href', openedPost.url);
    }
  },

  markViewedLink(state) {
    const existingPosts = document.querySelector('.posts ul');
    if (existingPosts) {
      [...existingPosts.children]
        .filter((li) => state.viewedPosts.has(li.firstElementChild
          .getAttribute('data-id')))
        .forEach((li) => {
          const link = li.firstElementChild;
          link.classList.remove('fw-bold');
          link.classList.add('fw-normal');
          link.classList.add('link-secondary');
        });
    }
  },

  renderPost(post, instance) {
    const listItem = document.createElement('li');
    listItem.classList
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

    listItem.append(link);
    listItem.append(button);

    return listItem;
  },

  renderFeed(feed) {
    const listItem = document.createElement('li');
    listItem.classList.add('list-group-item', 'border-0', 'border-end-0');

    const title = document.createElement('h3');
    title.classList.add('h6', 'm-0');
    title.textContent = feed.title;

    const description = document.createElement('p');
    description.classList.add('m-0', 'small', 'text-black-50');
    description.textContent = feed.description;

    listItem.append(title);
    listItem.append(description);

    return listItem;
  },

  renderLists(state, instance) {
    const containerForPosts = document.querySelector('.posts');
    containerForPosts.addEventListener('click', (evt) => {
      const visitedPostId = evt.target.getAttribute('data-id');
      state.viewedPosts.add(visitedPostId);
      state.modal = visitedPostId;
    });
    const innerPostContainer = this.createElementsContainer(instance.t('posts'));
    const postList = innerPostContainer.querySelector('ul');
    const posts = state.posts.map((post) => this.renderPost(post, instance));
    postList.append(...posts);

    const containerForFeeds = document.querySelector('.feeds');
    const innerFeedContainer = this.createElementsContainer(instance.t('feeds'));
    const feedList = innerFeedContainer.querySelector('ul');
    const feeds = state.feeds.map((feed) => this.renderFeed(feed));
    feedList.append(...feeds);

    if (posts.length) {
      containerForPosts.append(innerPostContainer);
      containerForFeeds.append(innerFeedContainer);
    }
  },

  renderNewElementsList(state, instance) {
    const postList = document.querySelector('.posts ul');
    const existingPosts = [...postList.children]
      .map((li) => li.firstElementChild.getAttribute('data-id'));
    const newPosts = state.posts
      .filter(({ postId }) => !existingPosts.includes(postId))
      .map((post) => this.renderPost(post, instance));
    postList.prepend(...newPosts);

    const feedList = document.querySelector('.feeds ul');
    const existingFeeds = [...feedList.children]
      .map((li) => li.firstElementChild.textContent);
    const newFeeds = state.feeds
      .filter(({ title }) => !existingFeeds.includes(title))
      .map((feed) => this.renderFeed(feed));
    feedList.prepend(...newFeeds);
  },
};

const render = (state, instance) => {
  const { formStatus, downloadStatus } = state;
  const { button, input, form } = elements;

  if (formStatus === 'sending') {
    button.disabled = true;
    input.disabled = true;
  } else {
    button.disabled = false;
    input.disabled = false;
  }

  if (downloadStatus === 'success') {
    form.reset();
  }
  if (!input.value && downloadStatus !== 'updating') {
    input.focus();
  }

  elements.renderQueryResult(state);
  elements.renderModalWindow(state);
  elements.markViewedLink(state);

  try {
    elements.renderNewElementsList(state, instance);
  } catch (e) {
    elements.renderLists(state, instance);
  }
};

export default render;
