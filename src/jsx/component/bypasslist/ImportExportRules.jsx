import React, { Component } from 'react';

class ImportExportRules extends Component {
  constructor(props) {
    super(props);

    const background = chrome.extension.getBackgroundPage();
    this.app = background.app;

    // properties
    this.bypasslist = this.app.util.bypasslist;
    this.region = this.app.util.regionlist.getSelectedRegion();

    // bindings
    this.onImportClick = this.onImportClick.bind(this);
  }

  onImportClick() {
    this.bypasslist.spawnImportTab();
    window.close();
  }

  render() {
    return (
      <div className="import-export-wrapper">
        <h3 className="bl_sectionheader">
          { t('ImportExportHeader') }
        </h3>

        <div className="buttons row">
          <button
            type="button"
            className="col-xs-4 col-xs-offset-1 btn btn-success"
            disabled={!this.region}
            onClick={this.onImportClick}
          >
            { t('ImportLabel') }
          </button>

          <button
            type="button"
            className="col-xs-4 col-xs-offset-2 btn btn-success"
            onClick={this.bypasslist.saveRulesToFile}
          >
            { t('ExportLabel') }
          </button>
        </div>
      </div>
    );
  }
}

export default ImportExportRules;
