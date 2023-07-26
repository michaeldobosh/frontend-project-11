const parse = ({ data }) => {
  const parser = new DOMParser();
  const rss = parser
    .parseFromString(data.contents, 'application/xml');
  const parseError = rss.querySelector('parsererror');
  if (parseError) {
    const error = new Error(parseError.textContent);
    error.isParsingError = true;
    error.data = data;
    error.code = 'parser_error';
    throw error;
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
