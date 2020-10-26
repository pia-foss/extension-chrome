import { t } from '@errorpages/utils';
import '@style/errorpage.scss';

((_, document) => {
  document.addEventListener('DOMContentLoaded', async () => {
    const pageTitle = document.querySelector('head title');
    const errorTitle = document.querySelector('h1#title');
    const errorMessage = document.querySelector('.error-message');
    const errorLead = document.querySelector('.error-support-lead');
    const errorEnd = document.querySelector('.error-support-end');
    pageTitle.textContent = await t('AuthFailPageTitle');
    errorTitle.textContent = await t('AuthFailTitle');
    errorMessage.innerHTML = await t('AuthFailMessage');
    errorLead.innerHTML = await t('AuthFailMessageSupportLead');
    errorEnd.innerHTML = await t('AuthFailMessageSupportEnd');
  });

  return this;
})(window, document);
