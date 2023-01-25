import onChange from 'on-change';

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

const renderFeeds = (state) => {
  const feeds = document.querySelector('.feeds');
  feeds.innerHTML = '';

  if (state.feeds.length > 0) {
    const feedDiv = createElWithClassesAndText('div', ['card', 'border-0']);
    feeds.appendChild(feedDiv);

    const feedTitle = createElWithClassesAndText('div', ['card-body']);
    const title = createElWithClassesAndText('h2', ['card-title', 'h4'], 'Feeds');
    feedTitle.appendChild(title);
    feedDiv.appendChild(feedTitle);

    const feedList = createElWithClassesAndText('ul', ['list-group', 'border-0', 'rounded-0']);
    feedDiv.appendChild(feedList);

    state.feeds.forEach((feed) => {
      const li = createElWithClassesAndText('li', ['list-group-item', 'border-0', 'border-end-0']);

      const liTitle = createElWithClassesAndText('h3', ['h6', 'm-0'], feed);
      li.appendChild(liTitle);

      const liDesc = createElWithClassesAndText('p', ['m-0', 'small', 'text-black-50'], `Description for ${feed}`);
      li.appendChild(liDesc);

      feedList.appendChild(li);
    });
  }

  setFeedback('RSS успешно загружен', 'success');

  document.querySelector('form').reset();
  document.querySelector('#url-input').focus();
};

export default (state) => {
  const watcher = onChange(state, (path) => {
    if (path === 'feeds') {
      renderFeeds(watcher);
    }

    if (path === 'rssForm.error') {
      setFeedback(watcher.rssForm.error, 'failed');
    }
  });

  return watcher;
};