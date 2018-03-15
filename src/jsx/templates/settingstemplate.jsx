import initPageTitle        from 'component/pagetitle'
import initBypassSettingSection       from 'component/bypasslist/settingsection'
import initSettingSection   from 'component/settingsection'
import initSettingItem      from 'component/settingitem'
import initDebugSettingItem from 'component/debugsettingitem'
import initLanguageDropdown from 'component/languagedropdown'

export default function(renderer, app, window, document) {
  const React           = renderer.react,
        PageTitle       = initPageTitle(renderer, app, window, document),
        BypassSettingSection = initBypassSettingSection(renderer, app, window, document),
        SettingSection  = initSettingSection(renderer, app, window, document),
        SettingItem     = initSettingItem(renderer, app, window, document),
        DebugSettingItem = initDebugSettingItem(renderer, app, window, document),
        LanguageDropdown = initLanguageDropdown(renderer, app, window, document),
        {chromesettings, contentsettings} = app,
        {proxy} = app,
        {settings, regionlist} = app.util

  return class extends React.Component {
    render() {
      return (
        <div id="settings-template" className="row">
          <div className="top-border" id="settings">
            <PageTitle previousTemplate="authenticated" text={t("ChangeExtensionSettings")}/>
            {this.warningDiv()}
            <div className="sectionwrapper security">
              <SettingSection label={t("Security")}>
                <SettingItem
                    id={contentsettings.flash.settingID}
                    label={t("BlockAdobeFlash")}
                    tooltip={t("AdobeFlashTooltip", {browser: app.buildinfo.browser})}
                />
                <SettingItem
                    id={chromesettings.webrtc.settingID}
                    controllable={chromesettings.webrtc.isControllable()}
                    label={t("WebRTCLeakProtection")}
                    tooltip={t("WebRTCTooltip", {browser: app.buildinfo.browser})}
                    setting={chromesettings.webrtc}
                />
              </SettingSection>
            </div>
            <div className="sectionwrapper privacy">
              <SettingSection label={t('Privacy')}>
                  <SettingItem
                      id={contentsettings.camera.settingID}
                      label={t("BlockCameraAccess")}
                      tooltip={t("BlockCameraAccessTooltip")}
                  />
                  <SettingItem
                      id={contentsettings.microphone.settingID}
                      label={t("BlockMicrophoneAccess")}
                      tooltip={t("BlockMicrophoneAccessTooltip")}
                  />
                  <SettingItem
                      id={contentsettings.location.settingID}
                      label={t("BlockLocationAccess")}
                      tooltip={t("BlockLocationAccessTooltip")}
                  />
                  <SettingItem
                      id={chromesettings.networkprediction.settingID}
                      controllable={chromesettings.networkprediction.isControllable()}
                      label={t("BlockNetworkPrediction")}
                      tooltip={t("BlockNetworkPredictionTooltip", {browser: app.buildinfo.browser})}
                      setting={chromesettings.networkprediction}
                  />
                  <SettingItem
                      id={chromesettings.safebrowsing.settingID}
                      controllable={chromesettings.safebrowsing.isControllable()}
                      label={t("BlockSafeBrowsing")}
                      tooltip={t("BlockSafeBrowsingTooltip", {browser: app.buildinfo.browser})}
                      learnMoreHref="https://en.wikipedia.org/wiki/Google_Safe_Browsing#Privacy"
                      learnMore={t("ReadMore")}
                      setting={chromesettings.safebrowsing}
                  />
              </SettingSection>
            </div>
            <div className="sectionwrapper tracking">
              <SettingSection label={t("Tracking")}>
                  <SettingItem
                      id={chromesettings.thirdpartycookies.settingID}
                      controllable={chromesettings.thirdpartycookies.isControllable()}
                      label={t("BlockThirdpartycookies")}
                      tooltip={t("BlockThirdpartycookiesTooltip", {browser: app.buildinfo.browser})}
                      setting={chromesettings.thirdpartycookies}
                  />
                  <SettingItem
                      id={chromesettings.httpreferer.settingID}
                      controllable={chromesettings.httpreferer.isControllable()}
                      label={t("BlockHTTPReferer")}
                      tooltip={t("BlockHTTPRefererTooltip", {browser: app.buildinfo.browser})}
                      setting={chromesettings.httpreferer}
                  />
                  <SettingItem
                      id={chromesettings.hyperlinkaudit.settingID}
                      controllable={chromesettings.hyperlinkaudit.isControllable()}
                      label={t("BlockHyperlinkAuditing")}
                      tooltip={t("BlockHyperlinkAuditingTooltip")}
                      setting={chromesettings.hyperlinkaudit}
                  />
                  <SettingItem
                      id="blockutm"
                      label={t("BlockUTM")}
                      tooltip={t("BlockUTMTooltip")}
                  />
                  <SettingItem
                      id="maceprotection"
                      label={t("MaceProtection")}
                      tooltip={t("MaceTooltip")}
                      learnMore={t("WhatIsMace")}
                      learnMoreHref={"https://helpdesk.privateinternetaccess.com/hc/en-us/articles/222979528"}
                  />
              </SettingSection>
            </div>
            <div className="sectionwrapper developer">
              <SettingSection label={t("Extension")}>
                <SettingItem
                    id={contentsettings.extensionNotification.settingID}
                    label={t("AllowExtensionNotifications")}
                    tooltip={t("AllowExtensionNotificationsTooltip")}
                />
                <SettingItem
                    id="debugmode"
                    label={t("DebugMode")}
                    tooltip={t("DebugModeTooltip")}
                />
                <DebugSettingItem />
                <div style={{color: "#333 !important"}} className='field settingitem noselect'>
                  <div className='col-xs-6 settingblock'>
                    <a className="macetooltip">
                      <label htmlFor="languages">
                        {t("UILanguage")}
                        <div className="popover arrow-bottom">{t("UILanguageTooltip")}</div>
                      </label>
                    </a>
                  </div>
                  <div className="col-xs-6 checkmarkcontainer">
                    <LanguageDropdown/>
                  </div>
                </div>
              </SettingSection>
            </div>
            <div className="sectionwrapper bypass">
              <BypassSettingSection/>
            </div>
            <div className='field panelfooter'>
              <div className='col-xs-12 settingblock'>
                v{app.buildinfo.version} (<a href="#" onClick={() => renderer.renderTemplate("changelog")}>View Changelog</a>)
                {this.gitInfo()}
              </div>
            </div>
          </div>
        </div>
      )
    }

    warningDiv() {
      const regionName = regionlist.getSelectedRegion().localizedName()
      if(proxy.enabled())
        return (
          <div className="settingswarning-connected noselect">
            {t("SettingsWarningConnected", {browser: app.buildinfo.browser, region: regionName})}
          </div>
        )
      else
        return (
          <div className="settingswarning-disconnected noselect">
            {t("SettingsWarning")}
          </div>
        )
    }

    gitInfo() {
      const {gitcommit,gitbranch} = app.buildinfo
      if([gitcommit,gitbranch].filter((e) => e && /^[a-zA-Z0-9\-.]+$/.test(e)).length === 2)
        return (
          <div className="gitinfo">
            <div className="row">
              <span className="branch col-xs-2">Branch</span>
              <span className="gitbranch">{gitbranch}</span>
            </div>
            <div className="row">
              <span className="commit col-xs-2">Commit</span>
              <span className="gitcommit">{gitcommit}</span>
            </div>
          </div>
        )
    }
  }
}
