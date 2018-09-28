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
    .catch((xhr) => {
      // hide loader icon
      loaderIcon.classList.add('hidden');
      // show the submit button again
      submitBtn.classList.remove('hidden');
      // show error message
      errorDiv.classList.remove('hidden');

      switch (xhr.tinyhttp.cause) {
        /* request complete but got something other than 200 status code */
        case 'status':
          if (xhr.status === 401) { errorDiv.innerHTML = t('WrongUsernameAndPassword'); }
          else if (xhr.status === 429) { errorDiv.innerHTML = t('TooManyRequestsError'); }
          else {
            const tParams = { statusLine: `${xhr.status} ${xhr.statusText}` };
            errorDiv.innerHTML = t('UnexpectedServerResponse', tParams);
          }
          break;
        /* request aborted (xhr.abort(), third-party extension using return {cancel: true}) */
        case 'abort':
          errorDiv.innerHTML = t('AbortError');
          break;
        /* network error while making request */
        case 'networkerror':
          errorDiv.innerHTML = window.navigator.onLine ? t('NetworkError') : t('OfflineError');
          break;
        /* request expired */
        case 'timeout':
          errorDiv.innerHTML = t('TimeoutError', { seconds: user.authTimeout / 1000 });
          break;
        default:
          errorDiv.innerHTML = t('UnknownError');
          break;
      }
    });
}
