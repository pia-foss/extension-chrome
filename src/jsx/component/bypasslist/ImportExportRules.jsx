import React, { Component } from 'react';
import { File } from 'helpers/file';

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
    this.onExportClick = this.onExportClick.bind(this);
  }

  onImportClick() {
    this.bypasslist.spawnImportTab();
    window.close();
  }

  onExportClick() {
    const payload = JSON.stringify({
      popularRules: this.bypasslist.enabledPopularRules(),
      userRules: this.bypasslist.getUserRules(),
    });
    const file = new File('application/json', [payload]);
    file.download('bypass-rules.json');
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
            onClick={this.onExportClick}
          >
            { t('ExportLabel') }
          </button>
        </div>
      </div>
    );
  }
}

export default ImportExportRules;
