import onChange from 'on-change';
import { markAsViewed } from './utils.js';

const setActiveRssForm = (isActive) => {
  const button = document.querySelector('button[aria-label="add"]');
  if (isActive) {
    button.classList.remove('disabled');
  } else {
    button.classList.add('disabled');
  }
};

const createElWithClassesAndText = (element, classes, text = '') => {
  const newElement = document.createElement(element);
  newElement.classList.add(...classes);
  newElement.textContent = text;
  return newElement;
};

const setFeedback = (text, type) => {
  const feedbackField = document.querySelector('.feedback');
  feedbackField.classList.remove('text-danger', 'text-success');

  const inputField = document.querySelector('#url-input');
  inputField.classList.remove('is-invalid');

  switch (type) {
    case 'failed':
      feedbackField.classList.add('text-danger');
      inputField.classList.add('is-invalid');
      break;
    case 'success':
    default:
      feedbackField.classList.add('text-success');
  }

  feedbackField.textContent = text;
};

const createListWrapper = (location, title) => {
  const mainDiv = createElWithClassesAndText('div', ['card', 'border-0']);
  location.appendChild(mainDiv);

  const titleDiv = createElWithClassesAndText('div', ['card-body']);
  const titleText = createElWithClassesAndText('h2', ['card-title', 'h4'], title);
  titleDiv.appendChild(titleText);
  mainDiv.appendChild(titleDiv);

  const ul = createElWithClassesAndText('ul', ['list-group', 'border-0', 'rounded-0']);
  mainDiv.appendChild(ul);

  return ul;
};

const renderFeeds = (state, i18next) => {
  const feeds = document.querySelector('.feeds');
  feeds.innerHTML = '';

  if (state.feeds.length > 0) {
    const feedList = createListWrapper(feeds, i18next.t('feedsTitle'));

    state.feeds.forEach(({ title, description }) => {
      const li = createElWithClassesAndText('li', ['list-group-item', 'border-0', 'border-end-0']);

      const liTitle = createElWithClassesAndText('h3', ['h6', 'm-0'], title);
      li.appendChild(liTitle);

      const liDesc = createElWithClassesAndText('p', ['m-0', 'small', 'text-black-50'], description);
      li.appendChild(liDesc);

      feedList.appendChild(li);
    });
  }
};

const resetRssForm = () => {
  document.querySelector('form').reset();
  document.querySelector('#url-input').focus();
};

const renderPosts = (state, i18next) => {
  const posts = document.querySelector('.posts');
  posts.innerHTML = '';

  if (!state.posts.length) {
    return;
  }

  const postsList = createListWrapper(posts, i18next.t('postsTitle'));

  state.posts.forEach(({
    title, link, id,
  }) => {
    const li = createElWithClassesAndText(
      'li',
      [
        'list-group-item',
        'd-flex',
        'justify-content-between',
        'align-items-start',
        'border-0',
        'border-end-0',
      ],
    );

    const viewedClassForATag = state.uiState.viewedPosts.includes(id) ? 'fw-normal' : 'fw-bold';
    const a = createElWithClassesAndText('a', [viewedClassForATag], title);
    a.setAttribute('href', new URL(link));
    a.setAttribute('data-id', id);
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'noopener noreferrer');

    a.addEventListener('click', () => {
      markAsViewed(id, state);
    });

    const button = createElWithClassesAndText('button', ['btn', 'btn-outline-primary', 'btn-sm'], i18next.t('postButton'));
    button.setAttribute('type', 'button');
    button.setAttribute('data-id', id);
    button.setAttribute('data-bs-toggle', 'modal');
    button.setAttribute('data-bs-target', '#modal');

    button.addEventListener('click', () => {
      markAsViewed(id, state);
      state.uiState.idDisplayedModel = id;  // eslint-disable-line
    });

    // [a, button].forEach((element) => {
    //   element.addEventListener('click', () => {
    //     markAsViewed(id, state);
    //   })
    // })

    li.appendChild(a);
    li.appendChild(button);
    postsList.appendChild(li);
  });
};

const renderViewedPost = (id) => {
  const post = document.querySelector(`[data-id="${id}"]`);
  post.classList.remove('fw-bold');
  post.classList.add('fw-normal');
};

const renderModal = (id, state) => {
  const post = state.posts.find((element) => element.id === id);
  document.querySelector('.modal-title').textContent = post.title;
  document.querySelector('.modal-body').textContent = post.description;
  document.querySelector('a.full-article').setAttribute('href', post.link);
};

export default (state, i18next) => {
  const watcher = onChange(state, (path, value, _previousValue, applyData) => {
    // if (path === 'feeds') {
    //   renderFeeds(watcher);
    // }

    // if (path === 'rssForm.error') {
    //   setFeedback(watcher.rssForm.error, 'failed');
    // }

    if (path === 'rssForm.state') {
      if (value === 'filling') {
        renderFeeds(watcher, i18next);
        renderPosts(watcher, i18next);
        setFeedback(i18next.t('successAdding'), 'success');
        resetRssForm();
        setActiveRssForm(true);
      }

      if (value === 'sending') {
        setActiveRssForm(false);
      }

      if (value === 'failed') {
        setFeedback(i18next.t(watcher.rssForm.error), 'failed');
        setActiveRssForm(true);
      }
    }

    if (path === 'autoUpdate.state') {
      if (value === 'updated') {
        renderPosts(watcher, i18next);
      }
    }

    if (path === 'uiState.viewedPosts') {
    // if (path.match(/^(uiState.posts).*/)) {
      const [id] = applyData.args;
      renderViewedPost(id);
    }

    if (path === 'uiState.idDisplayedModel') {
      renderModal(value, state);
    }
  });

  return watcher;
};
