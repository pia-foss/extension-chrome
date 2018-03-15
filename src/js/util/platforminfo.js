export default function(app) {
  this.os       = undefined
  this.arch     = undefined
  this.naclArch = undefined
  this.ready    = false

  this.isWindows = () => {
    return this.os === "win"
  }

  this.lineEnding = () => {
    return this.isWindows() ? "\r\n" : "\n"
  }

  chrome.runtime.getPlatformInfo((details) => {
    this.os = details.os
    this.arch = details.arch
    this.naclArch = details.nacl_arch
    this.ready = true
  })

  return this
}
