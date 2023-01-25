import './styles.scss';
import 'bootstrap';
import { object, string, setLocale } from 'yup';
import watcher from './view.js';

console.log('Start');

const getFeedList = (feeds) => feeds.map(({ name }) => name);

const app = () => {
  const initialState = {
    rssForm: {
      error: null,
      state: 'filling',
    },
    feeds: [],
  };

  const state = watcher(initialState);

  setLocale({
    mixed: {
      notOneOf: 'RSS уже существует',
    },
    string: {
      url: 'Ссылка должна быть валидным URL',
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
      .catch((error) => {
        console.log('State :', initialState);
        state.rssForm.error = error.toString().split(':')[1].trim();
        state.rssForm.state = 'failed';
      });
  });
};

app();
