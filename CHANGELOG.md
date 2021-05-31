__HEAD__

__v.3.1.0__ (13.05.2021)

* Latency loading remains stuck fixed
* After some time SL is not working fixed
* Bypasslist for firefox not working fixed
* New server endpoint

__v.3.0.2__ (08.02.2021)

* Hotfix for broken storage when updating to upper version

__v.3.0.1__ (03.02.2021)

* Fixed expand arrow from server list
* Temporarily addons not being temporarily fixed
* Connection animation respects the connection state

__v.3.0.0__ (2.02.2021)

* Same app feature

__v.2.4.4__ (07.12.2020)

* Added translations for onboarding and just in time

__v.2.4.3__ (19.11.2020)

* Just in time (rating system)

__v.2.3.2__ (12.11.2020)

* Hotfix for mace

__v.2.3.1__ (05.11.2020)

* Changed port for smart location

__v.2.3.0__ (29.10.2020)

* Adobe flash functionality is no more
* Added new light theme background and some styles for onboarding
* Added onboarding screen for new users
* Added new tab for extra features 
* IpTile is default true
* Settings are now default false when extension is installed
* No more warnings for new users
* Latency is the default tab

__v2.2.8__

* More translations.

__v2.2.7__ (15.09.2020)

* Translations and css changes for some of them.

__v2.2.6__

* Proxy Ip updates when changing tab

__v2.2.5__

* Fixed smart location not grabbing correct proxy
* Remember me now clears when false

__v2.2.3__ (25.08.2020)

* Added loading icon in region tile


__v2.2.2__ (05.08.2020)

* Smart location loading improvements
* Fix for smart location domain grab
* Fix for smart location current region changing

__v2.2.1__

* Always on changes and fixes

__v2.2.0__

* Added smart location feature

__v2.1.20__

* Fix proxy enabled status

__v2.1.19__

* Fix storage fails to retrieve falsy values

__v2.1.18__

* Add toggle for always active settings

__v2.1.17__

* Update e2e tests

__v2.1.16__

* Fix console error when bypass tile can't find the current tab url

__v2.1.15__

* Fix malformed support link on authentication failure page

__v2.1.14__

* Remove session storage

__v2.1.13__

* Fix memory leaks in extension

__v2.1.12__

* Transition to extension storage

__v2.1.11__

* Bundle region data with extension

__v2.1.10__

* Increase "Debug Log Copied" visibility to 5 secs

__v2.1.9__

* Update startup warning to be calmer

__v2.1.8__

* Fix styling issue with translated bypass list tile

__v2.1.7__

* Fix bug with storing https-upgrade rulesets on installation

__v2.1.6__

* Reset Drawer position on navigation

__v2.1.5__

* Initialize i18n with app.browser

__v2.1.4__

* Add IP tile

__v2.1.3__

* Add https-upgrade/rulesets unit tests

__v2.1.2__

* Remove unused locale keys

__v2.1.1__

* Update utils to ES6 classes

__v2.1.1__

* Update "tabs" permission to "activeTab"
* Fix Netflix Rule breaking proxy connections

__v2.1.0__

* Fix exclusions for https-upgrade
* Add unit tests for https-upgrade
* Fix translated region name spacing on region list
* Fix Issue with displaying Uncontrollable or Upgrade pages
* Fix failing tests
* Fix swapped camera and microphone images in quick settings
* Add unit tests for https-upgrade
* Improve latency test error handling
* Improve latency test results
* Change beta process to use zip files
* Fix translation capitalization
* Decouple privacy, security, tracking settings from proxy
* Fix navigational keybinds
* Update https-upgrade to PIA source
* Add chrome to browserslist to fix styling on chrome
* Add unit test framework
* Target relevant versions for "bug on Windows where foreground would not close when losing focus"
* Add badge to icon
* Add build name to settings page
* Add Bypass Rules Tile
* Adjust CSS to remove green dots from arrows on settings page
* Prevent button text in Debug Log from creating horizontal scrollbars
* Prevent text in Debug Log from creating horizontal scrollbars
* Fix Tile ordering on startup
* Disallow selection of Tile text
* Fix Setting text not updating on language change
* Refactor React code to use the context API for global data
* Migrate to Webpack
* Add React Router, Remove Renderer Class
* Add HTTPS Upgrade feature
* Enhance QA functionality

__v2.0.2__

* Revert latency frequency
* Convert latency test to use ips rather than domains

__v2.0.1__

* Extend latency test frequency to once a day

__v2.0.0__

* 2.0.0 Release
* Update Remember Me tooltip wording
* Add no-op to setAccount if account parameter is undefined
* Add maxlength to bypass rule input field (32779)
* Add maxlength to login input fields (253 chars)
* Backport CSS fixes for text breakout on DebugLog Page
* Beta Release
* Componentize Drawer Handle
* Add Checkmark on Export button after Bypasslist export completion
* Fix tile ordering on authenticated view on theme change
* Adjust spacing for new Translations
* Update Translations
* Add new tests for settings & tiles, improved test core
* Remove LogoutOnClose setting
* Fix bug where enabling extension in incognito would sometimes log user out
* Translate "view changelog"
* Add homepage to extension page
* Add setting to filter Facebook fbclid query parameters
* Refactor user to remove unnecessary properties
* Bypass-list Firefox parity
* Add Token Based Authentication
* Add Quick Settings Tile
* Add Subscription Tile
* Add Quick Connect Tile
* Convert current region component to Quick Region Tile
* Add Tiles system to main view
* Add Auto Region
* Add Region Latency refresh button when no regions found
* Move Region latency polling to a timer based system
* Add Region search by name feature
* Remove Region Grid View
* Update view components to met new design spec

__v1.8.1__

* 1.8.1 Release
* Fixed extension breaking on startup when proxy enabled

__v1.8.0__

* 1.8.0 Release
* Update Changelog to follow version releases
* Update Translations
* Bypass List Firefox Parity
* Updated beta & release scripts
* Fixed links in settings not disabling offline
* Disabled links when extension offline
* Removed links when setting disabled
* Fixed autofill setting
* Remove download dialog from Bypass Export
* Updated bypasslist import to use tab
* Fixed authentication dialog showing on google pages
* Fixed i18n util only replacing first dash in locale
* Fixed authfail test
* Fixed bug where exporting bypass rules would crash browser on linux
* Fixed spelling mistake in import window
* Added instructional message to import window
* Improved http error handling
* Added missing flags
* Refactored chromesettings
* Fixed authentication dialog presented after changing regions
* Moved remember me tooltip to avoid hiding submit button
* Hid debug button when debug mode is off
* Autofocus username input on login screen
* Refactored to use native fetch API
* Added link to Chrome Setting Bug in settingsmanager.js file
* Full Offline support for regions
* Fixed style issue on region sorter
* Improving test reliability
* Fixed issue where connfail page wouldn't redirect on refresh
* Added Offline Warning Banner
* Better Offline startup support
* Converted ruby tests to javascript

__v1.7.0__

* Updated Translations
* Updated Error handling to open close popup windows
* Fixed issue where user couldn't import bypass file after changing contents
* Fixed a styling issue with "Remember me" tooltip misplaced during login error.
* Fixed settings not being initialized properly
* Fixed bug where remember me tooltip was not showing on hover
* Fixed visual bug with popover on extension settings
* Updated Changelog to have consistent phrasing
* Fixed bug on Windows where foreground would not close when losing focus
* Updated NPM build script to include automated packaging
* Updated the Bypass list custom rule instructions and placeholder
* Fixed bug where foreground would not close on Windows 10
* Added error messages to import popup if file is invalid
* Added linting for airbnb style guide
* Fixed components breaking out of parent styling
* Added tooltip to remember me checkbox
* Updated remember me checkbox design
* Added "Log me out on browser close" setting
* Debounced proxy button to avoid crashing browser
* Fixed bug where extension automatically attempted to log user in
* Added try/catch along code base to catch any 'dead object' errors that hang the UI
* Fixed a bug where localStorage was not being cleared by unchecking "remember me"
* Centered add button on bypass list
* Routed Latency checks through HTTPS
* Added import/export feature for bypass list

__v1.6.2__

* Updated project dependencies
* Updated Region selection/favorite tab design

__v1.6.0__

* Update region translations
* Add Favorite Region view
* Updated Helpdesk links
* Updated translations for new Berlin region.

__v1.5.10__

* Updated translations for Washington DC region.

__v1.5.9__

* Bug fix for translation text overflow on login view
* Bug fix for copy pasting url into bypass list (trailing slash)
* Cosmetic changes to Bypass list view.

__v1.5.6__

* Updated new translations
* Add Disable Autofill setting in extension settings.
* Fix wrong url bug on error page due to network connection being unavailable.
* Clean chrome webstore and OneSky keys from repo.
* Add new bypass list page
* Fixed typo on Disable SafeBrowsing tooltip.
* Add 'View Debug Log' button to extension section of settings.

__v1.5.0__

* Fallback to the website if a flag icon cannot be found for a region locally on disk.
* Add flag assets for Austria and Belgium.
* Add a new setting "Disable SafeBrowsing".
  It is enabled by default.
* Show the PIA connection error page when a connection timeout(net::ERR_CONNECTION_TIMED_OUT)
  error is encountered.
* Request a new region list every 30 minutes, in case a new region is deployed
  while the extension is running.
* Set 'Remember me' option as a default for new users due to a Chrome bug that signs
  a user out when the extension is updated and this option is not selected.
* Add a 'Password Reset' link to the login page.
* Fix a bug where clicking "Copy Debug Log" on Windows and pasting the result
  into notepad.exe did not separate each entry with a newline.
* Fix a bug where the "remember me" text on login page did not have a pointer
  cursor, even though it can be clicked on to check and uncheck the remember me
  checkbox.
* Fix a bug where the template shown on an outdated version of Chrome was
  rendered as an empty white page instead of a page with an upgrade message.

__v1.4.0__

* Add a new setting: "Disable website referrer".
  It is enabled by default.
* Add a new setting: "Disable third party cookies".
  It is enabled by default.
* Add a new setting: "Disable hyperlink auditing".
  It is enabled by default.
* Add a new setting: "Disable network prediction".
  It is enabled by default.
* Add a new setting: "Remove UTM parameters".
  It is enabled by default.
* Add `10.0.0.0/8` to the list of IP ranges are automatically
  bypassed by the extension.
* Rephrase "Block WebRTC" setting as "Block WebRTC IP Detection".
* Improve icon quality for computers with different screen pixel
  densities.
* Add a button to the debug log page that can be used to clear the
  contents of the log.
* Add "Popular websites" checkbox options that include Netflix and
  Hulu under the "Bypass List" settings group.
* Add a new setting "UI Language" under the "Extension"
  settings group. It allows you to change the language
  the extension uses to display text.
* Add a new setting: "Allow desktop notifications".
  It is enabled by default, and when enabled the extension
  will create a desktop notification for important events.
* After Chrome has updated the extension show a desktop notification
  that lets user know they're running an updated version.
* Add the national flag of the region you are connected to
  onto the icon used to open the extensions popup window.
* While chrome and the extension are starting a timeglass icon is shown
  in place of the green or red robot icon until the extensions connection
  status is known.
* Don't apply an extension update while Chrome is running and
  "Remember me" is unchecked to avoid user being signed out when
  the update is applied. This fix will apply to versions **after**
  v1.4.0.
* Redesign the page shown when there's an authentication error.
* Redesign page shown when there's a connection error:
    * Add a "Try again" button to the page.
    * The keys "cmd+r", "ctrl+r", or "F5" (depending on your platform) will
      try to reload the URL that failed.
    * Include the name used by Chrome to describe the error.
* Redesign the settings page:
    * Group settings by topics (Security, Privacy, Tracking, Bypass List, Extension)
    * Each setting group is expanded or collapsed when clicked.
    * Header for each setting group contains the number of enabled settings within its group.
    * Header for bypass list section includes the number of rules added.
    * Disable checkbox and show a warning when a setting cannot be controlled.
    * Apply new style to checkbox and dropdown(&lt;select&gt;) elements, & restyle text.
* Change tooltip content that appears on hover of green or red robot icon:
    * While connected to a region show "You are connected to &lt;region name&gt;" as a tooltip.
    * While not connected show "You are disconnected" as a tooltip.
    * While logged out show "Private Internet Access" as a tooltip.
* Improve error handling during login:
  * Handle request being aborted
  * Handle network errors
  * Handle timed out requests
  * Improve login error messages, & improve visual appearance of login error messages.
  * Remove "Login failed due to an unknown error" error message.
* Open the client control panel using a subdomain that
  matches the language settings the extension is configured
  to use.
* Add support for automatically signing into the client
  control panel from https://nor.privateinternetaccess.com.
* Update URLs in the Changelog to be clickable links.

__v1.3.1__

* Fix a number of bugs that were present on older versions
  of Chrome (v48-v53):
  * The extension didn't work at all on Chrome v49.
  * Sorting by latency didn't work correctly.
  * It wasn't possible to open the debug log.
* The settings "Block Adobe Flash", "Block WebRTC", "Block camera access",
  "Block microphone access", and "Block location access" are only active
  while the extension is connected to a region.
* Clicking on the icon for help and support opens
  https://helpdesk.privateinternetaccess.com instead of the
  client support page.

__v1.3.0__

* Add a new page, "Debug Log", that is accessible by pressing the
  "ctrl" key followed by the "d" key while the extensions popup
  window is open.
* Reduce and stabilize the amount of memory the extension consumes
  over long periods of time.
* The left arrow key can be used to navigate to the previous page
  when the back icon(<) is visible on a page.
* Sort regions by name when sorting by latency cannot complete due
  to all regions being offline.
* Show a more relevant error message when login cannot complete because
  of an unexpected server response.

__v1.2.2__

* Fix a bug where the region grid could become misaligned when a region
  is removed from the grid.

__v1.2.1__

* Fix a bug where unchecking a setting such as "Block location access",
  "Block camera access", "Block microphone access", or "Block Adobe Flash"
  would unblock other settings as well.

__v1.2.0__

* Add a new setting, "Block location access", that when enabled blocks
  a website from accessing information about your physical location.
  It is enabled by default.
* Add a new setting, "Block camera access", that when enabled blocks
  websites from accessing your computers camera. It is enabled by
  default.
* Add a new setting, "Block microphone access", that when enabled blocks
  websites from accessing your computers microphone. It is enabled by
  default.
* Due to a bug in Chrome (v56), it is not possible to block plugins other
  than Adobe Flash. As a consequence, the "Block native plugins" setting
  on the settings page has been renamed to "Block Adobe Flash".
* When the "Block Adobe Flash" setting is unchecked the browser default
  for running flash content will be used, where as before flash content
  would be set to always run if "Block Adobe Flash" was unchecked.
* The "Block WebRTC" and "Block Adobe Flash" text appears clickable on hover,
  giving users a visual cue that the text can be clicked on to turn those
  settings on or off.
* Add tooltips that explain the purpose of the "Block WebRTC" and
  "Block Adobe Flash" settings.
* Redesign the tooltips of the menu icons on the authenticated page.
* Add a new page named "Changelog" that is accessible through the settings
  page. The page provides a short summary of recent changes.
* Add a new setting, "Debug mode", that when enabled prints debugging
  information to the console of the extensions background page. It is
  disabled by default.

__v1.1.0__

* During authentication, whitespace is removed from the username to help avoid
  copy and paste errors.
* Fix a bug that prevented the user from being able to disable the blocking
  of native plugins.
* Fix a bug that would sometimes cause Chrome to prompt the user for their
  username and password.
* Fix a bug that prevented the red robot icon from loading while switching
  regions.
* Region names have been translated in all languages where a translation was
  missing.
* The "Please wait" screen now includes a message that tells the user
  they are waiting for the extension to finish loading.
* The extension avoids running two or more latency tests in parallel, as
  doing so often produces inaccurate test results.
* A tooltip that appears on hover and explains the purpose of "PIA MACE™" was
  added to the Extension Settings page.
* The dropdown for choosing how to sort regions was redesigned.
* When a flag for a region cannot be found on disk, the extension will try to
  load the flag from the Private Internet Access website instead.
* A new swiss flag which includes corrections to the previous version was
  added.
* The regions listed as "Canada", "UK", and "Australia" have been renamed
  to: "CA Montreal", "UK London", and "AU Sydney".

__v1.0.11__

* First release.
