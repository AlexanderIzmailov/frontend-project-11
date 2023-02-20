/*  eslint no-param-reassign: ["error", { "props": false }] */

import axios from 'axios';
import onChange from 'on-change';
import { parseRssPromise, setIdForUpdatedPosts, getNewPosts } from './parser.js';

export const getFeedList = (state) => state.feeds.map(({ url }) => url);

export const createPostsUiState = (posts) => posts.map((post) => ({ id: post.id, readed: false }));

export const markAsViewed = (postId, state) => {
  const isViewed = state.uiState.viewedPosts.includes(postId);
  if (!isViewed) {
    state.uiState.viewedPosts.push(postId);
  }
};

export const getProxyLink = (url) => {
  const proxy = 'https://allorigins.hexlet.app';
  const resultUrl = new URL('get', proxy);
  resultUrl.searchParams.set('disableCache', true);
  resultUrl.searchParams.set('url', url);

  return resultUrl;
};

export const startUpdate = (state, delay) => {
  const update = (state, delay) => {  // eslint-disable-line
    onChange.target(state).autoUpdate.state = 'pending';

    const newPostsPromises = state.feeds.map((feed) => (
      axios.get(getProxyLink(new URL(feed.url)))
        .then((response) => parseRssPromise(response))
        .then((parsedRss) => getNewPosts(feed, state, parsedRss))
        .catch(() => [])
    ));

    Promise.all(newPostsPromises)
      .then((newPostsLists) => setIdForUpdatedPosts(newPostsLists, state))
      .then((result) => {
        if (result.length) {
          onChange.target(state).posts.unshift(...result);
          state.autoUpdate.state = 'updated';
        } else {
          onChange.target(state).autoUpdate.state = 'noUpdate';
        }
      })
      .finally(() => {
        startUpdate(state, delay);
      });
  };

  onChange.target(state).timerId = setTimeout(() => update(state, delay), delay);

  // Promise.all(newPostsP)
  // .then((newPostsLists) => setIdsParsedRssPromise({ posts: newPostsLists.flat() }, state))
  // .then((result) => {
  //   if (result.length) {
  //     state.updateState = 'pending';
  //     state.posts = result.posts.concat(state.posts);
  //     state.updateState = 'done';
  //   }
  // })
  // .finally(() => {
  //   setTimeout(() => refresh(state), 5000);
  // })

  // Promise.all(newPostsP)
  // .then((newPostsLists) => {
  //   const posts = newPostsLists.flat();
  //   if (posts.length) {
  //     return setIdsParsedRssPromise({ posts }, state)
  //   }
  // })
  // .then((result) => {
  //   if (!result) {
  //     state.updateState = 'noUpdates';
  //   } else {
  //     state.posts = result.posts.concat(state.posts);
  //     state.updateState = 'updated';
  //   }
  // })
  // .finally(() => {
  //   setTimeout(() => refresh(state), 5000);
  // })

  // Promise.all(newPostsP)
  //   .then((newPostsLists) => {
  //     const posts = newPostsLists.flat();
  //     if (!posts.length) {
  //       state.updateState = 'noUpdates';
  //       return
  //     }
  //     setIdsParsedRssPromise({ posts }, state)
  //       .then((result) => {
  //         state.posts = result.posts.concat(state.posts);
  //         state.updateState = 'updated';
  //       })
  //   })
  //   .finally(() => {
  //     console.log('SET TIMER!');
  //     state.timerId = setTimeout(() => refresh(state), 5000);
  //     console.log('Timer id :', state.timerId)
  //   })

  // setTimeout(() => refresh(state), 5000);
};
