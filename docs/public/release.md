## Chrome/Opera Public Release Process:

###  Update Translations and commit (If needed)
- `grunt oneskyImport` will upload the `src/_locales/en/messages.json` to OneSky
- Order translations from the OneSky website (should take around 3 days)
- `grunt oneskyExport` will update all the other locale files
- Create a commit for these updated translations with the commit message "Update Translations"

### Update region data
- go to https://www.privateinternetaccess.com/api/client/services/https
- pull latest region data
- update `src/js/data/regions.json` with latest data

###  Update VERSION / CHANGELOG and commit
- Update VERSION and CHANGELOG files to latest Public Version Number
- Update CHANGELOG by clearing out all patch versions since last release version
- Create a commit for this change with the commit message `{versionNumber} Public Release`

###  Create CRX file, ZIP file, and info.md files
- `npm run release` This will generate and upload the extension to the chrome store
- `npm run public:opera` This is generate the extension, but you'll need to upload to the opera store manually

### Notify Web team to update the client portal
- Message template:
  - `Chrome/Opera v{versionNumber} and Firefox v{FirefoxVersionNumber} Extension have been released publicly.`
- Clean up any files that aren't needed anymore
