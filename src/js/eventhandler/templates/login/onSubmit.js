export default function onSubmt(renderer, app, event) {
  event.preventDefault();

  const { user } = app.util;
  const errorDiv = document.querySelector('.text-danger');
  const submitBtn = document.querySelector('#submit-form-button');
  const loaderIcon = document.querySelector('.loader');

  // hide submit button
  submitBtn.classList.add('hidden');
  // show loading icon
  loaderIcon.classList.remove('hidden');

  // try to authenticate user
  user.auth()
    .then(() => { return renderer.renderTemplate('authenticated'); })
    .catch((res) => {
      // hide loader icon
      loaderIcon.classList.add('hidden');
      // show the submit button again
      submitBtn.classList.remove('hidden');
      // show error message
      errorDiv.classList.remove('hidden');

      switch (res.cause) {
        /* request complete but got something other than 200 status code */
        case 'status': {
          const { status, statusText } = res;
          if (res.status === 401) { errorDiv.innerHTML = t('WrongUsernameAndPassword'); }
          else if (res.status === 429) { errorDiv.innerHTML = t('TooManyRequestsError'); }
          else {
            const tParams = { statusLine: `${status} ${statusText}` };
            errorDiv.innerHTML = t('UnexpectedServerResponse', tParams);
          }
          break;
        }

        // In event other extension cancels request, not currently functional
        // requires 'abort' API in fetch
        case 'abort': {
          errorDiv.innerHTML = t('AbortError');
          break;
        }

        case 'offline': {
          errorDiv.innerHTML = t('OfflineError');
          break;
        }

        /* request expired */
        case 'timeout': {
          errorDiv.innerHTML = t('TimeoutError', { seconds: user.authTimeout / 1000 });
          break;
        }

        default: {
          errorDiv.innerHTML = t('UnknownError');
          console.error('onSubmit.js: unknown error');
          console.error(`error: ${JSON.stringify(res, Object.getOwnPropertyNames(res))}`);
          break;
        }
      }
    });
}
