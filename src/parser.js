const parse = ({ data }) => {
  const parser = new DOMParser();
  const rss = parser
    .parseFromString(data.contents, 'application/xml');
  const error = rss.querySelector('parsererror');
  if (error) {
    return `${error.tagName}: ${error.textContent}`;
  }

  const feedTitle = rss.querySelector('title');
  const feedDescription = rss.querySelector('description');
  const items = [...rss.querySelectorAll('item')];

  const parsedPosts = items
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

  const parsedFeed = {
    title: feedTitle.textContent,
    description: feedDescription.textContent,
  };

  return { parsedFeed, parsedPosts };
};

export default parse;
