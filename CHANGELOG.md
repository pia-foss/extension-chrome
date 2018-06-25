__HEAD__

__v1.6.0__

* Add Favorite Region view

__v1.5.11__

* Update Helpdesk links

* Update translations for new Berlin region.

__v1.5.10__

* Update translations for Washington DC region.

__v1.5.9__

* Bug fix for translation text overflow on login view

__v1.5.8__

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
