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

export const parseRssPromise = (response) => {
  const promise = new Promise((resolve, reject) => {
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

  return promise;
};

export const setIdsParsedRssPromise = (parsedRss, state) => {
  const feedId = state.feeds.length + 1;
  let postStartId = state.posts.length;

  const newPosts = parsedRss.posts
    .reverse()
    .map((post) => ({ ...post, feedId, id: postStartId += 1 })) // eslint-disable-line
    .reverse();

  const result = {
    ...parsedRss,
    feed: { ...parsedRss.feed, id: feedId },
    posts: newPosts,
  };

  return new Promise((resolve) => {
    resolve(result);
  });
};

export const setIdForUpdatedPosts = (posts, state) => {
  let postStartId = state.posts.length;
  const postsWithId = posts
    .flat()
    .reverse()
    .map((post) => ({ ...post, id: postStartId += 1 })) // eslint-disable-line
    .reverse();

  return new Promise((resolve) => {
    resolve(postsWithId);
  });
};

export const getNewPosts = (feed, state, parsedRss) => {
  const feedId = feed.id;
  const currentPostsGuids = state.posts
    .filter((post) => post.feedId === feedId)
    .map((post) => post.guid);

  const newPostsWithFeedId = parsedRss.posts
    .filter((post) => !currentPostsGuids.includes(post.guid))
    .map((post) => ({ ...post, feedId }));

  return new Promise((resolve) => {
    resolve(newPostsWithFeedId);
  });
};

// export const setIdsParsedRssPromise = (parsedRss, state) => {
//   const feedId = state.feeds.length + 1;
//   const newPostsLength = parsedRss.posts.length;
//   let postStartId = state.posts.length + newPostsLength + 1;
//   console.log('Start ID: ', postStartId);

//   // eslint-disable-next-line
//   const newPosts = parsedRss.posts.map((post) => ({ ...post, feedId, id: postStartId -= 1 }));

//   const result = { ...parsedRss, feed: { ...parsedRss.feed, id: feedId }, posts: newPosts };

//   return new Promise((resolve) => {
//     resolve(result);
//   });
// };

// const getNewPosts3 = (feed, state, parsedRss) => {
//   const { id } = feed;
//   const currentPosts = state.posts.filter((post) => post.feedId === id);
//   const currentGuids = currentPosts.map((post) => post.guid);

//   const newPosts = parsedRss.posts.filter((post) => !currentGuids.includes(post.guid));
//   // const newPostsWithFeedId = newPosts.map((post) => ({ ...post, feedId}))

//   const result = {
//     feedId: id,
//     posts: newPosts,
//   }

//   console.log('Result :', result);
//   return new Promise((resolve) => {
//     resolve(result);
//   });
// };

// const setIdForUpdatedPosts2 = (newPosts, state) => {
//   let postStartId = state.posts.length;

//   const resultPosts = newPosts
//     .filter((posts) => posts.posts.length)
//     .map((post1) => post1.posts
//       .map((post2) => ({ ...post2, feedId: post1.feedId})))
//     .flat()
//     .reverse()
//     .map((post) => ({ ...post, id: postStartId += 1 })) // eslint-disable-line
//     .reverse()

//   return new Promise ((resolve) => {
//     resolve(resultPosts);
//   })
// };

// const getNewPosts1 = (currentPosts, receivedPosts, feedId) => {
//   const currentGuids = currentPosts.map((post) => post.guid);
//   const newPosts = receivedPosts.filter((post) => !currentGuids.includes(post.guid));
//   const newPostsWithFeedId = newPosts.map((post) => ({ ...post, feedId }))

//   return new Promise((resolve) => {
//     resolve(newPostsWithFeedId);
//   });
// };
