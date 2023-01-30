import onChange from 'on-change';

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

const renderFeeds = (state, i18next) => {
  setActiveRssForm(true);

  const feeds = document.querySelector('.feeds');
  feeds.innerHTML = '';

  if (state.feeds.length > 0) {
    const feedDiv = createElWithClassesAndText('div', ['card', 'border-0']);
    feeds.appendChild(feedDiv);

    const feedTitle = createElWithClassesAndText('div', ['card-body']);
    const title = createElWithClassesAndText('h2', ['card-title', 'h4'], i18next.t('feedsTitle'));
    feedTitle.appendChild(title);
    feedDiv.appendChild(feedTitle);

    const feedList = createElWithClassesAndText('ul', ['list-group', 'border-0', 'rounded-0']);
    feedDiv.appendChild(feedList);

    state.feeds.forEach(({ title, description }) => {
      const li = createElWithClassesAndText('li', ['list-group-item', 'border-0', 'border-end-0']);

      const liTitle = createElWithClassesAndText('h3', ['h6', 'm-0'], title);
      li.appendChild(liTitle);

      const liDesc = createElWithClassesAndText('p', ['m-0', 'small', 'text-black-50'], description);
      li.appendChild(liDesc);

      feedList.appendChild(li);
    });
  }

  setFeedback(i18next.t('successAdding'), 'success');

  document.querySelector('form').reset();
  document.querySelector('#url-input').focus();
};

const renderPosts = (state, i18next) => {
  const posts = document.querySelector('.posts');
  posts.innerHTML = '';

  if (state.posts.length > 0) {
    const postsDiv = createElWithClassesAndText('div', ['card', 'border-0']);
    posts.appendChild(postsDiv);

    const postsTitle = createElWithClassesAndText('div', ['card-body']);
    const title = createElWithClassesAndText('h2', ['card-title', 'h4'], i18next.t('postsTitle'));
    postsTitle.appendChild(title);
    postsDiv.appendChild(postsTitle);

    const postsList = createElWithClassesAndText('ul', ['list-group', 'border-0', 'rounded-0']);
    postsDiv.appendChild(postsList);

    state.posts.forEach(({ title, link, description, id }) => {
      const li = createElWithClassesAndText('li',
      [
        'list-group-item',
        'd-flex',
        'justify-content-between',
        'align-items-start',
        'border-0',
        'border-end-0',
      ]);

      const a = createElWithClassesAndText('a', ['fw-bold'], title);
      a.setAttribute('href', new URL (link));
      a.setAttribute('data-id', id);
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener noreferrer');

      li.appendChild(a);
      postsList.appendChild(li);
    })
  }
}

export default (state, i18next) => {
  const watcher = onChange(state, (path, value) => {
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
      }

      if (value === 'sending') {
        setActiveRssForm(false);
      }

      if (value === 'failed') {
        // setFeedback(watcher.rssForm.error, 'failed');
        setFeedback(i18next.t(watcher.rssForm.error), 'failed');
      }
    }
  });

  return watcher;
};
