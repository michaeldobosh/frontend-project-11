import axios from 'axios';

const request = (url) => {
  const proxy = 'https://allorigins.hexlet.app/get?disableCache=true&url=';
  return axios.get(`${proxy}${encodeURIComponent(url)}`);
};

const parsing = (rss) => {
  const parser = new DOMParser();
  return Promise.resolve(parser.parseFromString(rss, 'application/xml'));
};

const writePost = (rss, state) => {
  const titlesOnPages = state.dataForm.posts.map(({ title }) => title);
  rss.querySelectorAll('item').forEach((post) => {
    const titlePost = post.querySelector('title').textContent;
    if (!titlesOnPages.includes(titlePost)) {
      state.dataForm.posts.unshift({
        url: post.querySelector('link').textContent,
        title: titlePost,
        description: post.querySelector('description').textContent,
        viewed: false,
        modal: false,
      });
    }
  });
};

const setIntervalCheck = (state) => {
  state.dataForm.feeds.forEach(({ url }) => {
    request(url)
      .then((response) => parsing(response.data.contents))
      .then((rss) => writePost(rss, state));
  });
  setTimeout(() => setIntervalCheck(state), 5000);
};

export {
  parsing,
  setIntervalCheck,
  request,
  writePost,
};
