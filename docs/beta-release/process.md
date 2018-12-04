## Chrome Beta Release Process:

###  Update Translations and commit
- `grunt oneskyImport` will upload the `src/_locales/en/messages.json` to OneSky
- Order translations from the OneSky website (should take around 3 days)
- `grunt oneskyExport` will update all the other locale files
- Create a commit for these updated translations with the commit message "Update Translations"

###  Update VERSION / CHANGELOG and commit
- Update VERSION and CHANGELOG files to latest Beta Version Number
- Create a commit for this change with the commit message `{versionNumber} Beta Release`

###  Create CRX file, ZIP file, and info.md files
- `npm run beta`

###  Update info.md file in `./builds/info.md`
- The changelog in this file should be updated so that no patch numbers are referenced
- Changelog should only include work since last beta release
- Update the Date of Release to when the Beta should go out to the public

### Create master zip file with all generated files
- `node script/chromeBetaMasterZip`
- This should create a zip file with the ending `*-beta-release.zip` with all three files included.

### Notify Web team to update the client portal
- Send the master zip file to the web team through the #general-escalation channel
- Slack message template: `@web Here's the files for Chrome v{versionNumber} Extension Beta Release`
- Include the master zip file in the above slack message
- clean up any files that aren't needed anymore


## Chrome Zip File Contents:
- INFO.md
- CRX File
- ZIP File
