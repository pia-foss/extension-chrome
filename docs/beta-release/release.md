## Chrome Beta Release Process:

### Update .env file
- Update RELEASE_DATE
- UPDATE CHANGELOG_START and CHANGELOG_END
- UPDATE FF_VERSION

###  Update Translations and commit
- `grunt oneskyImport` will upload the `src/_locales/en/messages.json` to OneSky
- Order translations from the OneSky website (should take around 3 days)
- `grunt oneskyExport` will update all the other locale files
- Create a commit for these updated translations with the commit message "Update Translations"

### Update region data
- go to https://www.privateinternetaccess.com/api/client/services/https
- pull latest region data
- update `src/js/data/regions.json` with latest data

###  Update VERSION / CHANGELOG and commit
- Update VERSION and CHANGELOG files to latest Beta Version Number
- Update CHANGELOG by clearing out all patch versions since last release version
- Create a commit for this change with the commit message `{versionNumber} Beta Release`
  - `git commit` add `--allow-empty` if no files to commit

## Go to the Firefox Repo and follow the steps there
- Update .env file
- Update Translations
- Update Version and ChangeLog
- Generate a beta build for Firefox and info-firefox.json file

###  Create CRX file, ZIP file, and info.md files
- `npm run beta`

### Create master zip file with all generated files
- `npm run beta:release`
- This should create a zip file with the ending `*-beta-release.zip` with all six files included.

### Notify Web team to update the client portal
- Send the master zip file to the web team through the #general-escalation channel
- Message template:
  - `Here's the files for Chrome/Opera v{versionNumber} and Firefox v{FirefoxVersionNumber} Extension Beta Release`
- Include the master zip file in the above message
- clean up any files that aren't needed anymore

### Merge beta into develop
- `git checkout develop`
- `git pull origin develop`
- `get merge --no-ff beta/{betaReleaseVersion}`

## Zip File Contents:
- info.json
- CRX File
- ZIP File (Chrome)
- NEX File
- ZIP File (Opera)
- XPI File
