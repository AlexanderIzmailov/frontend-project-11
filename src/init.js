import './styles.scss';
import 'bootstrap';
import { object, string, setLocale } from 'yup';
import i18n from 'i18next';
import axios from 'axios';
import onChange from 'on-change';
import resources from './locales/index.js';
import watcher, { setTexts } from './view.js';
import { errorCodes, MyError } from './errorHandlers.js';
import { parseRssPromise, setIdsParsedRssPromise } from './parser.js';
import { startUpdate, getProxyLink, getFeedList } from './utils.js';

console.log('Start');

const initializei18next = async () => {
  const lng = 'ru';
  const i18next = i18n.createInstance();

  await i18next
    .init({
      lng,
      debug: false,
      resources,
    })
    .then(() => {
      setTexts(i18next);
    });

  return i18next;
};

export default async () => {
  const i18next = await initializei18next();

  // initialize state
  const initialState = {
    test: null,
    rssForm: {
      error: null,
      state: 'filling',
    },
    feeds: [],
    posts: [],
    autoUpdate: {
      state: null,
      delay: 5000,
    },
    uiState: {
      viewedPosts: [],
      idDisplayedModal: null,
    },
  };

  const state = watcher(initialState, i18next);

  // initialize yup
  setLocale({
    mixed: {
      notOneOf: () => {
        throw new MyError('ERR_NOT_ONE_OF');
      },
    },
    string: {
      // url: 'errors.invalidUrl',
      url: () => {
        // throw { msg: 'errors.alreadyExist', code: 'ERR_URL' }
        // throw new Error({ msg: 'errors.alreadyExist', code: 'ERR_URL' });
        throw new MyError('ERR_URL');
      },
    },
  });

  const form = document.querySelector('.rss-form');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    state.rssForm.state = 'sending';

    const feedList = getFeedList(state);

    const urlSchema = object({
      url: string().url().required().notOneOf(feedList),
    });

    const formData = new FormData(e.target);

    urlSchema.validate(Object.fromEntries(formData))
      .then((validated) => axios.get(getProxyLink(validated.url)))
      .then((response) => parseRssPromise(response))
      .then((parsedRss) => setIdsParsedRssPromise(parsedRss, state))
      .then((parsedRssWithIds) => {
        onChange.target(state).feeds.unshift(parsedRssWithIds.feed);
        onChange.target(state).posts.unshift(...parsedRssWithIds.posts);

        state.rssForm.state = 'filling';

        if (!state.updateState) {
          onChange.target(state).updateState = true;
          startUpdate(state, state.autoUpdate.delay);
        }

        console.log('State: ', state);
      })
      .catch((err) => {
        onChange.target(state).rssForm.error = errorCodes[err.code];
        state.rssForm.state = 'failed';
      });
  });

  // Test button
  // const testButton = document.querySelector('#test-button');
  // testButton.addEventListener('click', () => {
  //   clearTimeout(state.timerId);
  //   // onChange.target(state).uiState.posts.unshift('aaaa');
  // });
};
