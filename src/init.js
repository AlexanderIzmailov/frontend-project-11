import './styles.scss';
import 'bootstrap';
import { object, string, setLocale } from 'yup';
import i18n from 'i18next';
import axios from 'axios';
import watcher from './view.js';

console.log('Start');

const getFeedList = (feeds) => feeds.map(({ url }) => url);

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
            alreadyExist: 'RSS уже существует',
            invalidUrl: 'Ссылка должна быть валидным URL',
            thereIsNoRss: 'Ресурс не содержит валидный RSS',
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
    // console.log('feedList :', feedList);
    const urlSchema = object({
      url: string().url().required().notOneOf(feedList),
    });

    const formData = new FormData(e.target);
    const url = formData.get('url');

    urlSchema.validate({ url })
      .then(() => {
        state.rssForm.state = 'sending';
        // Wait for result

        return axios.get(getProxyLink(url)).then((response) => {
          const parsedRss = parsRss(response);
          const parsedRssWithIds = setIds(parsedRss, state);
          // console.log('parsedRss :', parsedRss);
          console.log('parsedRssWithId :', parsedRssWithIds);
          state.feeds.unshift(parsedRssWithIds.feed);
          state.posts = parsedRssWithIds.posts.concat(state.posts);
          state.rssForm.state = 'filling';
        })
        .catch(() => {
          // console.log('ERROR INSIDE :', error);
          throw {
            errors: ['errors.thereIsNoRss'],
          }
        })

        // state.feeds.push({ name: url, description: `Description for ${url}` });
        // state.rssForm.state = 'filling';

        // Wait for result
        // setTimeout(() => {
        //   state.rssForm.state = 'filling';
        // }, 1000);
        // if something went wrong: state.rssForm.state = 'failed'
      })
      .catch((err) => {
        console.log ('ERROR :', err)
        console.log ('ERROR2 :', JSON.stringify(err))
        const [error] = err.errors;
        state.rssForm.error = error;
        state.rssForm.state = 'failed';
      });
  });

  // Test
  const testButton = document.querySelector('#test-button');
  testButton.addEventListener('click', () => {
    const origin = 'https://allorigins.hexlet.app/get?disableCache=true&url=';
    const address = 'https://example.com';
    axios.get(`${origin}${address}`)
      .then((res) => {
        const data = res.data.contents;
        const parser = new DOMParser();
        const doc1 = parser.parseFromString(data, "application/xml");
        const items = doc1.querySelectorAll('item');
        // items.forEach((item) => {
        //   console.log(item.querySelector('title').textContent)
        // })
        console.log(res.data)
      })
  })
};

const parsRss = (response) => {
  // console.log('response :', response)
  const parser = new DOMParser();
  const data = response.data.contents;
  const parsedDoc = parser.parseFromString(data, "application/xml");
  const items = parsedDoc.querySelectorAll('item');
  const url = response.config.url.searchParams.get('url');

  const posts = Array.from(items).reduce((acc, item) => {
    const newPost = {};
    Array.from(item.children).forEach((child) => {
      newPost[child.tagName] = child.textContent;
    })
    acc.push(newPost);
    return acc;
  }, []);

  return {
    feed: {
      title: parsedDoc.querySelector('title').textContent,
      description: parsedDoc.querySelector('description').textContent,
      url,
    },
    posts,
  }
}

const setIds = (parsedRss, state) => {
  const feedId = state.feeds.length + 1;
  let postStartId = state.posts.length;

  const newPosts = parsedRss.posts.map((post) => ({ ...post, feedId, id: postStartId += 1 }));

  return { ...parsedRss, feed: { ...parsedRss.feed, id: feedId }, posts: newPosts };
}

const getProxyLink = (url) => {
  const proxy = 'https://allorigins.hexlet.app';
  const resultUrl = new URL ('get', proxy);
  resultUrl.searchParams.set('disableCache', true);
  resultUrl.searchParams.set('url', url)
  // return `${proxy}${url}`;
  // return new URL(proxy, url);
  return resultUrl;
}