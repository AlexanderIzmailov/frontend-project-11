import './styles.scss';
import 'bootstrap';
import { object, string, setLocale } from 'yup';
import watcher from './view.js';

console.log('Start');

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

    initialState.rssForm.error = null;

    const urlSchema = object({
      url: string().url().required().notOneOf(state.feeds),
    });

    const formData = new FormData(e.target);
    const url = formData.get('url');

    urlSchema.validate({ url })
      .then(() => {
        state.feeds.push(url);
      })
      .catch((error) => {
        console.log('State :', initialState);
        state.rssForm.state = 'failed';
        state.rssForm.error = error.toString().split(':')[1].trim();
      });
  });
};

app();
