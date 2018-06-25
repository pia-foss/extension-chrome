import React, {Component} from 'react';
import PropTypes from 'prop-types';

class ImportExportRules extends Component {
  constructor (props) {
    super(props);

    // Bindings
    this.onImportClick = this.onImportClick.bind(this);
  }

  onImportClick () {
    const {util: {bypasslist}} = this.props.app;
    bypasslist.spawnImportTab();
  }

  render () {
    return (
      <div className="import-export-wrapper">
        <h3 className="bl_sectionheader">{t("ImportExportHeader")}</h3>
        <div className="buttons row">
          <button
            className="col-xs-4 col-xs-offset-1 btn btn-success"
            onClick={this.onImportClick}
          >{t('ImportLabel')}</button>
          <button
            className="col-xs-4 col-xs-offset-2 btn btn-success"
            onClick={this.props.app.util.bypasslist.saveRulesToFile}
          >{t('ExportLabel')}</button>
        </div>
      </div>
    );
  }
}

ImportExportRules.propTypes = {
  renderer: PropTypes.object,
  app: PropTypes.object,
};

export default ImportExportRules;
