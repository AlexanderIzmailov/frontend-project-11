import { MyError } from './errorHandlers.js';

// export const parsRss = (response) => {
//   const parser = new DOMParser();
//   const parsedResponse = parser.parseFromString(response.data.contents, 'application/xml');
//   const items = parsedResponse.querySelectorAll('item');

//   const posts = Array.from(items).reduce((acc, item) => {
//     const newPost = {};
//     Array.from(item.children).forEach((child) => {
//       newPost[child.tagName] = child.textContent;
//     });
//     acc.push(newPost);
//     return acc;
//   }, []);

//   return {
//     feed: {
//       title: parsedResponse.querySelector('title').textContent,
//       description: parsedResponse.querySelector('description').textContent,
//       url: response.config.url.searchParams.get('url'),
//     },
//     posts,
//   };
// };

export const parsRssPromise = (response) => {
  const p = new Promise((resolve, reject) => {
    const parser = new DOMParser();
    const parsedResponse = parser.parseFromString(response.data.contents, 'application/xml');
    const items = parsedResponse.querySelectorAll('item');

    if (items.length === 0) {
      reject(new MyError('ERR_MISSING_RSS'));
    }

    const posts = Array.from(items).reduce((acc, item) => {
      const newPost = {};
      Array.from(item.children).forEach((child) => {
        newPost[child.tagName] = child.textContent;
      });
      acc.push(newPost);
      return acc;
    }, []);

    const result = {
      feed: {
        title: parsedResponse.querySelector('title').textContent,
        description: parsedResponse.querySelector('description').textContent,
        url: response.config.url.searchParams.get('url'),
      },
      posts,
    };

    resolve(result);
  });

  return p;
};

// export const setIds = (parsedRss, state) => {
//   const feedId = state.feeds.length + 1;
//   let postStartId = state.posts.length;

//   // eslint-disable-next-line
//   const newPosts = parsedRss.posts.map((post) => ({ ...post, feedId, id: postStartId += 1 }));

//   return { ...parsedRss, feed: { ...parsedRss.feed, id: feedId }, posts: newPosts };
// };

export const setIdsPromise = (parsedRss, state) => {
  const feedId = state.feeds.length + 1;
  let postStartId = state.posts.length;

  // eslint-disable-next-line
  const newPosts = parsedRss.posts.map((post) => ({ ...post, feedId, id: postStartId += 1 }));

  const result = { ...parsedRss, feed: { ...parsedRss.feed, id: feedId }, posts: newPosts };

  return new Promise((resolve) => {
    resolve(result);
  });
};
