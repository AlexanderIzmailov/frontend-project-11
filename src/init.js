import './styles.scss';
import 'bootstrap';
import { object, string, setLocale } from 'yup';
import i18n from 'i18next';
import axios from 'axios';
import watcher from './view.js';
// import errorCodes from './errorCodes.js';
import { codes, MyError } from './errorHandlers.js';
import { parsRssPromise, setIdsPromise } from './parser.js';

console.log('Start');

const getFeedList = (feeds) => feeds.map(({ url }) => url);

const getProxyLink = (url) => {
  const proxy = 'https://allorigins.hexlet.app';
  const resultUrl = new URL('get', proxy);
  resultUrl.searchParams.set('disableCache', true);
  resultUrl.searchParams.set('url', url);

  return resultUrl;
};

export default async () => {
  const i18next = i18n.createInstance();
  await i18next.init({
    lng: 'ru',
    defub: true,
    resources: {
      ru: {
        translation: {
          successAdding: 'RSS успешно загружен',
          feedsTitle: 'Фиды',
          postsTitle: 'Посты',
          errors: {
            notOneOf: 'RSS уже существует',
            url: 'Ссылка должна быть валидным URL',
            rss: 'Ресурс не содержит валидный RSS',
            network: 'Ошибка сети',
          },
        },
      },
    },
  });

  const initialState = {
    rssForm: {
      error: null,
      state: 'filling',
    },
    feeds: [],
    posts: [],
  };

  const state = watcher(initialState, i18next);

  setLocale({
    mixed: {
      // notOneOf: 'errors.alreadyExist',
      notOneOf: () => {
        // throw { msg: 'errors.alreadyExist', code: 'ERR_NOT_ONE_OF' }
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

    initialState.rssForm.state = null;

    const feedList = getFeedList(state.feeds);

    const urlSchema = object({
      url: string().url().required().notOneOf(feedList),
    });

    const formData = new FormData(e.target);

    urlSchema.validate(Object.fromEntries(formData))
      .then((validated) => {
        state.rssForm.state = 'sending';
        return axios.get(getProxyLink(validated.url));
      })
      .then((response) => parsRssPromise(response))
      .then((parsedRss) => setIdsPromise(parsedRss, state))
      .then((parsedRssWithIds) => {
        state.feeds.unshift(parsedRssWithIds.feed);
        state.posts = parsedRssWithIds.posts.concat(state.posts);
        state.rssForm.state = 'filling';
      })
      .catch((err) => {
        state.rssForm.error = codes[err.code];
        state.rssForm.state = 'failed';
      });
  });

  // Test
  const testButton = document.querySelector('#test-button');
  testButton.addEventListener('click', () => {
    // const origin = 'https://allorigins.hexlet.app/get?disableCache=true&url=';
    // const address = 'https://example.com';
    // axios.get(`${origin}${address}`)
    //   .then((res) => {
    //     const data = res.data.contents;
    //     const parser = new DOMParser();
    //     const doc1 = parser.parseFromString(data, 'application/xml');
    //     const items = doc1.querySelectorAll('item');
    //     items.forEach((item) => {
    //       console.log(item.querySelector('title').textContent);
    //     });
    //     console.log(res.data);
    //   });
    try {
      throw new MyError('Test');
    } catch (e) {
      console.log('ERROR :', e);
      console.log('Code :', e.code);
    }
  });
};
