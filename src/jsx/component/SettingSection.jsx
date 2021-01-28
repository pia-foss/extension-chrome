import PropTypes from 'prop-types';
import React, { Component } from 'react';
import withAppContext from '@hoc/withAppContext';

class SettingsSection extends Component {
  constructor(props) {
    super(props);

    // properties
    this.app = props.context.app;
    this.state = { open: false };
    this.i18n = this.app.util.i18n;
    // bindings
    this.toggleSection = this.toggleSection.bind(this);
    this.toggleDefaultSection = this.toggleDefaultSection.bind(this);
  }

  toggleSection() {
    const { open } = this.state;
    this.setState({ open: !open });
  }

  toggleDefaultSection(){
    const { defaultOpen } = this.props;
    if(defaultOpen){
      this.toggleSection()
    }
  }

  componentDidMount () {
    this.toggleDefaultSection();
  }

  render() {
    const { open } = this.state;
    const {
      name,
      label,
      enabledCount,
      totalCount,
      children,
      
    } = this.props;
    // this.toggleDefaultSection();
    const theme = this.props.context.getTheme();
    const lang = this.i18n.locale ? this.i18n.locale : 'en';

    return (
      <div className={`section-wrapper ${name} ${theme} ${open ? 'open' : ''} ${lang}`}>
        <div
          role="button"
          tabIndex="-1"
          className="section-header noselect"
          onClick={this.toggleSection}
          onKeyPress={this.toggleSection}
        >
          <span className="section-label">
            { label }
          </span>

          <div className="rightalign">
            <span className="counts">
              { enabledCount }
              /
              { totalCount }
              &nbsp;
              { t('enabled') }
            </span>

            <span className="expandicon" />
          </div>
        </div>

        <div className={`section-body ${lang}`}>
          { children }
        </div>
      </div>
    );
  }
}

SettingsSection.propTypes = {
  enabledCount: PropTypes.number.isRequired,
  totalCount: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  context: PropTypes.object.isRequired,
  children: PropTypes.oneOfType([PropTypes.object, PropTypes.array]).isRequired,
};

export default withAppContext(SettingsSection);
