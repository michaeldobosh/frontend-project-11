import axios from 'axios';

const parsing = (rss) => {
  const parser = new DOMParser();
  return parser.parseFromString(rss, 'application/xml');
};

const checkForUpdates = (state) => {
  state.dataForm.feeds.forEach(({ url }) => {
    axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`)
      .then((response) => parsing(response.data.contents))
      .then((rss) => rss.querySelectorAll('item').forEach((item) => {
        const [titlePost, description, urlPost] = item.children;
        const titlesOnPages = state.dataForm.posts.map(({ title }) => title);
        if (!titlesOnPages.includes(titlePost.textContent)) {
          state.dataForm.posts.unshift({
            url: urlPost.textContent,
            title: titlePost.textContent,
            description: description.textContent,
          });
        }
      }));
  });
};

const setIntervalCheck = (state) => {
  checkForUpdates(state);
  setTimeout(() => setIntervalCheck(state), 5000);
};

export { parsing, setIntervalCheck };
