[![PIA logo][pia-image]][pia-url]

README v0.3 / 25 May 2018


# Private Internet Access
Private Internet Access is the world's leading consumer VPN service. At Private Internet Access we believe in unfettered access for all, and as a firm supporter of the open source ecosystem we have made the decision to open source our VPN clients. For more information about the PIA service, please visit our website [privateinternetaccess.com](https://privateinternetaccess.com).


# Chrome Web Extension
This repo contains all the code needed to build and run the Private Internet Access Chrome Web Extension. This extension allows a user to access our network of proxies across the world from their web browser. Users can choose a proxy server location and connect to it directly from the extension. Additional privacy and security features include disabling microphone and camera, blocking flash and ip discovery through WebRTC, and can automatically block ads and tracking through PIA MACE™.

Please be advised that connecting to a proxy through our extension only protects traffic from that particular browser and not on applications that may be installed on the operating system itself.


## About
This client allows a user to sign-in to their PIA account and choose a particular proxy server to route all their browser traffic through. The client itself is has additional features such as:
 - Block Adobe flash
 - Block WebRTC IP Detection
 - Block Camera access
 - Block Microphone Access
 - Block Location access
 - Disable Network Prediction
 - Disable SafeBrowsing
 - Disable Third Party Cookies
 - Disable Website Referrer
 - Disable Hyperlink Auditing
 - Remove UTM Parameters
 - PIA MACE™ (block ads, trackers, and malicious content)
 - Allow direct connections for whitelisted sites


## Usage
Please start by ensuring that all the requirements in the [Installation](#installation) section of this README is installed. For more information, please refer to that section.

Building the client is as simple as running the build command:

    browser=chrome build=debug grunt

For Windows users, please set your environment variables using:

    set browser=chrome
    set build=debug
    grunt

The unpacked extension can be installed from the following url in chrome: [chrome://extensions/](chrome://extensions/)


## Installation
#### Requirements
 - Git (latest)
 - NodeJS 8.1.0 or greater
 - Chrome Web Browser (support for the latest two versions)

**Git**
Please use these instructions to install Git on your computer if it is not already installed: [Installing Git](https://gist.github.com/derhuerst/1b15ff4652a867391f03)

**NodeJS**
We recommend installing NodeJS via [nvm](https://github.com/creationix/nvm) on MacOS and Linux. On Windows, you can simply use the node installer found [here](https://nodejs.org/en/).


#### Download Codebase
Using the terminal:

    git clone https://github.com/pia-foss/extension-chrome.git

or use a graphical interface like [Git Desktop](https://desktop.github.com/) to download this repository into a directory of your choosing.


#### Setup
The extension uses Ruby and NodeJS to build itself and run automated tests.
Bundle is used when managing Ruby gems. NPM is used when managing node packages.

To install all dependencies the extension needs to build run:

    npm install


#### Building
Before building the extension, the Grunt CLI tool will need to be installed. Grunt can be install by
running the following command:

    npm install -g grunt

To build the extension, run one of the commands below.
When the build is finished `./builds/<build name>` will have been created, and it can be loaded as an unpacked extension in Chrome.

  **option 1: (a build that makes debugging easier)**

    browser=chrome build=debug grunt

  For windows users, please use:

    set browser=chrome
    set build=debug
    grunt

  **option 2: (a production build, that targets the webstore)**

    browser=chrome build=webstore grunt

  For Windows users, please use:

    set browser=chrome
    set build=webstore
    grunt

A build can be configured to include the git branch and commit SHA it is being built from
by including gitinfo=yes at command line:

    browser=chrome build=webstore gitinfo=yes grunt

For Windows users, please use:

    set browser=chrome
    set build=webstore
    set gitinfo=yes
    grunt

The git information is shown on the extension settings page if the build was configured to
include it. By default this feature is turned off but enabled when publishing a QA build
to the webstore.


#### Loading Extension

  * Enter "chrome://extensions" into Chrome's address bar.
  * Tick "Developer Mode" if it isn't already.
  * Click "Load unpacked extension", and choose the path to the build directory.


## Testing
**Ensure that the following environment variables are set before running tests**

**WAIT_TIME**

**TEST_USERNAME**

**TEST_PASSWORD**

**EXTENSION_ID**

**MANIFEST_KEY**


#### Testing

**Requirements**

- npm

**Running tests**

Simply run the npm command

    npm test

And the entire test suite will be run


## Translations

**Ensure that a `config/oneskyauthfile.json` exist before uploading translations. This file should contain the public and secret keys for your 1sky account**
**Ensure that the ONESKY_PROJECT_ID environment variable is set**

The extension supports all locales found in `src/_locales`. The translations are
translated by the 1sky service. `src/_locales/en/messages.json` can be uploaded to 1sky
using the following grunt task:

    grunt oneskyImport

Translations for all locales can be downloaded with the following task:

    grunt oneskyExport


## Deployment
#### Deploying to the Chrome Webstore

**Ensure the `webstore.pem` file exists.**
**Ensure the following environment variables are set before uploading to the webstore.**
**WEBSTORE_CLIENT_ID**
**WEBSTORE_CLIENT_SECRET**
**WEBSTORE_REFRESH_TOKEN**
**WEBSTORE_PUBLIC_ID**
**WEBSTORE_INTERNAL_ID**
**SLACK_HOOK**


To publish the extension onto the webstore from the command line for either internal
users(eg QA) or the general public, you can run one of the following:

  **For internal users only**

    browser=chrome audience=internal build=webstore grunt release


  **For all users**

    browser=chrome audience=public build=webstore grunt release


## Contributing
By contributing to this project you are agreeing to the terms stated in the Contributor License Agreement (CLA) [here](/CLA.rst). For more details please see  [CONTRIBUTING.md](/.github/CONTRIBUTING.md). Issues and Pull Requests should use these templates: [ISSUES](/.github/ISSUE_TEMPLATE.md) and [PULL REQUESTS](/.github/PULL_REQUEST_TEMPLATE.md)


## Authors
 - Robert Gleeson
 - Edward Kim
 - Amir Malik
 - Manish Jethani
 - Pericles


## License
This project is licensed under the [MIT (Expat) license](https://choosealicense.com/licenses/mit/), which can be found [here](/LICENSE).

<!-- Markdown link & img dfn's -->
[pia-image]: https://www.privateinternetaccess.com/assets/PIALogo2x-0d1e1094ac909ea4c93df06e2da3db4ee8a73d8b2770f0f7d768a8603c62a82f.png
[pia-url]: https://www.privateinternetaccess.com/
[wiki]: https://en.wikipedia.org/wiki/Private_Internet_Access
