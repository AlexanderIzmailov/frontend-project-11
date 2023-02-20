import './styles.scss';
import 'bootstrap';
import { object, string, setLocale } from 'yup';
import i18n from 'i18next';
import axios from 'axios';
import onChange from 'on-change';
import watcher from './view.js';
import { errorCodes, MyError } from './errorHandlers.js';
import { parseRssPromise, setIdsParsedRssPromise } from './parser.js';
import { startUpdate, getProxyLink, getFeedList } from './utils.js';

console.log('Start');

const setTexts = (i18next) => {
  const title = document.querySelector('#title');
  title.textContent = i18next.t('page.title');

  const addButton = document.querySelector('#addButton');
  addButton.textContent = i18next.t('page.addButton');

  const example = document.querySelector('#example');
  example.textContent = `${i18next.t('page.exampleString')}: ${i18next.t('page.exampleFeed')}`;

  const modalButtonRead = document.querySelector('#modalButtonRead');
  modalButtonRead.textContent = i18next.t('modal.read');

  const modalButtonClose = document.querySelector('#modalButtonClose');
  modalButtonClose.textContent = i18next.t('modal.close');
};

const initializei18next = async () => {
  const i18next = i18n.createInstance();
  await i18next.init({
    lng: 'ru',
    defub: true,
    resources: {
      ru: {
        translation: {
          feedback: {
            successAdding: 'RSS успешно загружен',
            errors: {
              notOneOf: 'RSS уже существует',
              url: 'Ссылка должна быть валидным URL',
              rss: 'Ресурс не содержит валидный RSS',
              network: 'Ошибка сети',
            },
          },
          page: {
            title: 'RSS агрегатор',
            addButton: 'Добавить',
            exampleString: 'Пример',
            exampleFeed: 'https://ru.hexlet.io/lessons.rss',
            feedsTitle: 'Фиды',
            postsTitle: 'Посты',
            postButton: 'Просмотр',
          },
          modal: {
            read: 'Читать полностью',
            close: 'Закрыть',
          },
        },
      },
    },
  });

  setTexts(i18next);

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
      idDisplayedModel: null,
    },
  };

  const state = watcher(initialState, i18next);

  // initialize yup
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

    onChange.target(state).rssForm.state = null;

    const feedList = getFeedList(state);

    const urlSchema = object({
      url: string().url().required().notOneOf(feedList),
    });

    const formData = new FormData(e.target);

    urlSchema.validate(Object.fromEntries(formData))
      .then((validated) => {
        state.rssForm.state = 'sending';
        return axios.get(getProxyLink(validated.url));
      })
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
        state.rssForm.error = errorCodes[err.code];
        state.rssForm.state = 'failed';
      });
  });

  // Test
  // const testButton = document.querySelector('#test-button');
  // testButton.addEventListener('click', () => {
  //   clearTimeout(state.timerId);
  //   // onChange.target(state).uiState.posts.unshift('aaaa');
  // });
};
