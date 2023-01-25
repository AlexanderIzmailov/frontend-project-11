import './styles.scss';
import 'bootstrap';
import { object, string, setLocale } from 'yup';
import i18n from 'i18next';
import watcher from './view.js';

console.log('Start');

const getFeedList = (feeds) => feeds.map(({ name }) => name);

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
          errors: {
            alreadyExist: 'RSS уже существует',
            invalidUrl: 'Ссылка должна быть валидным URL',
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
  };

  const state = watcher(initialState, i18next);

  setLocale({
    mixed: {
      notOneOf: 'errors.alreadyExist',
    },
    string: {
      url: 'errors.invalidUrl',
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
    const url = formData.get('url');

    urlSchema.validate({ url })
      .then(() => {
        state.rssForm.state = 'sending';
        // Wait for result

        // Create test feed
        state.feeds.push({ name: url, description: `Description for ${url}` });

        // Wait for result
        setTimeout(() => {
          state.rssForm.state = 'filling';
        }, 1000);
        // if something went wrong: state.rssForm.state = 'failed'
      })
      .catch((err) => {
        const [error] = err.errors;
        state.rssForm.error = error;
        state.rssForm.state = 'failed';
      });
  });
};
