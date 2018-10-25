export default function(app) {
  const greenRobots = {
          16:  "/images/icons/icon16.png",
          32:  "/images/icons/icon32.png",
          48:  "/images/icons/icon48.png",
          64:  "/images/icons/icon64.png",
          128: "/images/icons/icon128.png"
        },
        redRobots = {
          16:  "/images/icons/icon16red.png",
          32:  "/images/icons/icon32red.png",
          48:  "/images/icons/icon48red.png",
          64:  "/images/icons/icon64red.png",
          128: "/images/icons/icon128red.png"
        },
        newCanvasCtx = (image) => {
          const canvas = document.createElement('canvas')
          canvas.width = image.width
          canvas.height = image.height
          return canvas.getContext('2d')
        },
        newImage = (imagePath) => {
          return new Promise((resolve, reject) => {
            const image = new Image()
            image.src = imagePath
            image.onload = () => resolve(image)
            image.onerror = reject
          })
        },
        drawImage = (ctx, image, x=0, y=0) => {
          ctx.drawImage(image, x, y, image.width, image.height)
          return ctx
        },
        drawFlagOnto = (ctx, flag) => {
          const fctx = drawImage(newCanvasCtx(flag), flag)
          drawBorder(fctx, {lineWidth: 1, height: flag.height, width: flag.width, color: "#000000"})
          ctx.putImageData(fctx.getImageData(0, 0, flag.width, flag.height), 0, flag.width - (flag.width * (9/16)))
        },
        drawBorder = (ctx, map) => {
          const {width, height, color, lineWidth} = map
          ctx.strokeStyle = color
          ctx.lineWidth = lineWidth
          ctx.strokeRect(0, 0, width, height)
        },
        getFlagPath = (regionISO, size) => {
          return `/images/flags/${regionISO}_icon_${size}.png`
        },
        getFlagUrl = (regionISO, size) => {
          return `https://www.privateinternetaccess.com/images/flags/icons/${regionISO}_icon_${size}px.png`
        }

  this.online = async () => {
    const imageData = {},
          region    = app.util.regionlist.getSelectedRegion()
    for(let size in greenRobots) {
      let flag  = null,
          robot = await newImage(greenRobots[size]),
          ctx   = drawImage(newCanvasCtx(robot), robot)
      try {
        flag = await newImage(getFlagPath(region.iso, size))
      }
      catch(e) {
        try { flag = await newImage(getFlagUrl(region.iso, size)) }
        catch(e) { debug(`icon.js: flag icon failed (region = ${region.iso}, size = ${size})`) }
      }
      if(flag) drawFlagOnto(ctx, flag)
      imageData[size] = ctx.getImageData(0, 0, robot.width, robot.height)
    }
    if(app.proxy.enabled()) {
      chrome.browserAction.setIcon({imageData})
      debug("icon.js: set icon online")
      this.updateTooltip()
    } else {
      debug("icon.js: ignore set icon online, not online")
    }
  }

  this.offline = async () => {
    const imageData = {}
    for(let size in redRobots) {
      let redrobot = await newImage(redRobots[size]),
          ctx      = drawImage(newCanvasCtx(redrobot), redrobot)
      imageData[size] = ctx.getImageData(0, 0, redrobot.width, redrobot.height)
    }
    if(!app.proxy.enabled()) {
      chrome.browserAction.setIcon({imageData})
      debug("icon.js: set icon offline")
      this.updateTooltip()
    } else {
      debug("icon.js: ignore set icon offline, we're online")
    }
  }

  this.updateTooltip = () => {
    const {proxy} = app,
          {regionlist, user} = app.util
    let title
    if(proxy.enabled())
      title = t("YouAreConnectedTo", {region: regionlist.getSelectedRegion().localizedName()})
    else
      title = user.authed ? t("YouAreNotConnected") : "Private Internet Access"
    chrome.browserAction.setTitle({title})
    debug(`icon.js: tooltip updated`)
  }

  return this
}
