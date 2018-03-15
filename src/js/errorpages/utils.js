import "babel-polyfill"

export const t = (localeKey) => {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({request: "t", localeKey}, (res) => {
      resolve(res.m)
    })
  })
}
