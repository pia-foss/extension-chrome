import "babel-polyfill";
import storage            from "util/storage"
import settings           from "util/settings"
import icon               from "util/icon"
import regionlist         from "util/regionlist"
import regionsorter       from "util/regionsorter"
import user               from "util/user"
import bypasslist         from "util/bypasslist"
import latencytest        from "util/latencytest"
import buildinfo          from "util/buildinfo"
import logger             from "util/logger"
import counter            from "util/counter"
import settingsmanager    from "util/settingsmanager"
import errorinfo          from "util/errorinfo"
import i18n               from "util/i18n"
import platforminfo       from "util/platforminfo"

import microphone            from "contentsettings/microphone"
import camera                from "contentsettings/camera"
import location              from "contentsettings/location"
import flash                 from "contentsettings/flash"
import extensionNotification from "contentsettings/extension_notification"

import hyperlinkaudit    from "chromesettings/hyperlinkaudit"
import webrtc            from "chromesettings/webrtc"
import thirdpartycookies from "chromesettings/thirdpartycookies"
import httpreferer       from "chromesettings/httpreferer"
import networkprediction from "chromesettings/networkprediction"
import safebrowsing      from "chromesettings/safebrowsing"
import BrowserProxy      from "chromesettings/proxy"
import eventhandler from "eventhandler/eventhandler"

(new function(window) {
  const self = Object.create(null),
        deepFreeze = (obj) => {
          if(@@freezeApp)
            for(let p in obj)
              obj[p] = Object.freeze(obj[p])
          return Object.freeze(obj)
        }

  self.frozen = @@freezeApp
  self.buildinfo    = new buildinfo(self)
  self.logger       = new logger(self)
  self.eventhandler = new eventhandler(self)
  window.debug = self.logger.debug /* eslint-ignore no-unused-vars */

  self.util = Object.create(null);
  self.util.platforminfo       = new platforminfo(self);
  self.util.icon               = new icon(self);
  self.util.storage            = new storage(self);
  self.util.settings           = new settings(self);
  self.util.i18n               = new i18n(self);
  self.util.regionlist         = new regionlist(self);
  self.util.bypasslist         = new bypasslist(self);
  self.util.counter            = new counter(self);
  self.util.user               = new user(self);
  self.util.latencytest        = new latencytest(self);
  self.util.regionsorter       = new regionsorter(self);
  self.util.settingsmanager    = new settingsmanager(self);
  self.util.errorinfo          = new errorinfo(self);
  self.util = Object.freeze(self.util);

  /* self.proxy is a %{browser}Setting like self.chromesettings.* objects are. */
  self.proxy = Object.freeze(BrowserProxy(self));

  self.contentsettings = Object.create(null);
  self.contentsettings.camera      = new camera(self);
  self.contentsettings.microphone  = new microphone(self);
  self.contentsettings.location    = new location(self);
  self.contentsettings.flash       = new flash(self);
  self.contentsettings.extensionNotification = new extensionNotification(self);
  self.contentsettings = deepFreeze(self.contentsettings);

  self.chromesettings = Object.create(null);
  self.chromesettings.networkprediction = new networkprediction(self);
  self.chromesettings.httpreferer       = new httpreferer(self);
  self.chromesettings.hyperlinkaudit    = new hyperlinkaudit(self);
  self.chromesettings.webrtc            = new webrtc(self);
  self.chromesettings.thirdpartycookies = new thirdpartycookies(self);
  self.chromesettings.safebrowsing      = new safebrowsing(self);
  self.chromesettings = deepFreeze(self.chromesettings);

  (() => {
    const {proxy} = self,
          {user,settings,regionlist} = self.util
    settings.setDefaults()

    if(!user.inStorage())
      proxy.disable()
    if(!regionlist.synced)
      regionlist.sync()

    proxy.readSettings().then(() => {
      if(!proxy.isControllable())
        return
      if(user.inStorage())
        user.auth().catch(proxy.disable)
    })
    window.app = Object.freeze(self)
    debug("background.js: initialized")
  })()
}(window, document))
