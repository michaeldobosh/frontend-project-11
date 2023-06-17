const parser = new DOMParser();

const parse = (data) => Promise.resolve(data)
  .then((streams) => streams.map((stream) => parser
    .parseFromString(stream.data.contents, 'application/xml')))
  .then((loadedData) => loadedData.reduce((acc, rss) => {
    const error = rss.querySelector('parsererror');
    if (error) {
      throw new Error(error);
    }

    const feedTitle = rss.querySelector('title');
    const feedDescription = rss.querySelector('description');
    const items = [...rss.querySelectorAll('item')];

    const posts = items
      .map((item) => {
        const url = item.querySelector('link');
        const title = item.querySelector('title');
        const description = item.querySelector('description');
        return {
          url: url.textContent,
          title: title.textContent,
          description: description.textContent,
        };
      });

    const feed = {
      title: feedTitle.textContent,
      description: feedDescription.textContent,
    };

    acc.feeds.push(feed);
    acc.posts.push(...posts);
    return acc;
  }, { feeds: [], posts: [] }))
  .catch((error) => error);

export default parse;
