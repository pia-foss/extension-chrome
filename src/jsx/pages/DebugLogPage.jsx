import PropTypes from 'prop-types';
import Timestamp from 'react-timeago';
import React from 'react';

import PageTitle from '@component/PageTitle';
import withAppContext from '@hoc/withAppContext';
import ClipboardButton from '@component/ClipboardButton';
import DeleteLogButton from '@component/DeleteLogButton';

function DebuglogPage(props) {
  const {
    context: {
      theme,
      app: {
        logger,
        util: {
          platforminfo,
        },
      },
    },
  } = props;
  const entries = logger.getEntries();

  if (platforminfo.ready === false) {
    return (
      <div id="debuglog-page" className={`row ${theme}`}>
        <PageTitle text={t('DebugLog')} />
        <p className="still-loading">
          { t('TheExtensionIsStillLoading') }
        </p>
      </div>
    );
  }
  if (entries.length === 0) {
    return (
      <div id="debuglog-page" className={`row ${theme}`}>
        <PageTitle text={t('DebugLog')} />

        <p className="no-entries">
          { t('DebugLogIsEmpty') }
        </p>
      </div>
    );
  }
  let counter = 0;
  return (
    <div id="debuglog-page" className={`row ${theme}`}>
      <PageTitle text={t('DebugLog')} />

      <div className="debug-buttons">
        <ClipboardButton />
        <DeleteLogButton />
      </div>

      <ul>
        { entries.map(([timestamp, message]) => {
          counter += 1;
          return (
            <li key={counter}>
              <div className="bold">
                { message }
              </div>

              <Timestamp live={false} date={timestamp} />
            </li>
          );
        }) }
      </ul>
    </div>
  );
}

DebuglogPage.propTypes = {
  context: PropTypes.object.isRequired,
};

export default withAppContext(DebuglogPage);
