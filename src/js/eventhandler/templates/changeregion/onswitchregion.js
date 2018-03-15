export default function(renderer, app) {
  this.handler = (region) => {
    const {proxy} = app,
          {regionlist} = app.util
    regionlist.setSelectedRegion(region.id)
    proxy.enable(region).then(() => renderer.renderTemplate("authenticated"))
  }
  return this
}
