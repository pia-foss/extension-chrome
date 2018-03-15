export default function(renderer, app) {
  this.handler = (event, region) => {
    const {target} = event,
          filename = `${region.iso.toLowerCase()}_3x.png`,
          websiteFlag = `https://www.privateinternetaccess.com/images/flags/${filename}`
    if(target.getAttribute('src') !== websiteFlag)
      target.setAttribute('src', websiteFlag)
  }

  return this
}
