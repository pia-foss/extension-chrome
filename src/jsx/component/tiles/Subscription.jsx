import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Tile from '@component/tiles/Tile';
import withAppContext from '@hoc/withAppContext';

class Subscription extends Component {
  constructor(props) {
    super(props);

    // properties
    this.app = props.context.app;
    this.user = this.app.util.user;
    this.storage = this.app.util.storage;
    this.state = { plan: '', expiration: undefined };

    try {
      const account = this.storage.getItem('account');
      this.state.plan = account.plan;
      this.state.expiration = account.expiration_time;
    }
    catch (err) { /* noop */ }

    // binding
    this.generateSubscriptionData = this.generateSubscriptionData.bind(this);
  }

  generateSubscriptionData() {
    let expirationDays = 0;
    const oneDay = 1000 * 60 * 60 * 24;
    const { plan, expiration } = this.state;

    if (plan && expiration) {
      const expirationTime = new Date(expiration * 1000).getTime();
      const now = new Date().getTime();
      const timeDiff = expirationTime - now;
      expirationDays = Math.round(timeDiff / oneDay);
    } else {
      this.user.updateAccount()
        .then((account) => {
          const accountPlan = account.plan;
          const accountExpiration = account.expiration_time;
          this.setState({ plan: accountPlan, expiration: accountExpiration });
        });
    }


    if (plan && expirationDays) {
      return (
        <div className="subscription-content">
          <span className="subscription-plan">
          { t('trial') }
          </span>

          <span className="subscription-expiration">
            { ` (${expirationDays} `+t('days_left')+`)` }
          </span>
        </div>
      );
    }

    return (
      <div className="subscription-content">
        <span className="subscription-error">
          { t('NoSubscriptionData') }
        </span>
      </div>
    );
  }

  render() {
    const {
      saved,
      hideFlag,
      toggleTileSaved,
      context: { theme },
    } = this.props;

    return (
      <Tile
        name="Subscription"
        saved={saved}
        hideFlag={hideFlag}
        toggleTileSaved={toggleTileSaved}
      >
        <div className={`subscription ${theme}`}>
          <div className="subscription-header">
            { t('Subscription') }
          </div>

          { this.generateSubscriptionData() }
        </div>
      </Tile>
    );
  }
}

Subscription.propTypes = {
  saved: PropTypes.bool.isRequired,
  hideFlag: PropTypes.bool.isRequired,
  context: PropTypes.object.isRequired,
  toggleTileSaved: PropTypes.func.isRequired,
};

export default withAppContext(Subscription);
