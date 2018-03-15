export default function(app) {
  const basename = (filename) => {
    return filename.split("/").slice(-1)
  }

  return (e) => {
    const {filename, lineno, message} = e
    app.logger.debug(`javascript error at ${basename(filename)}:${lineno}: ${message}`)
  }
}
