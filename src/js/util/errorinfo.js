export default function(app) {
  const errorMap   = new Map([]),
        generateID = () => {
          let errorID = ""
          for(let i = 0; i < 3; i++)
            errorID += Math.random().toString(36)
          return errorID
        }

  this.set = (errorName, url) => {
    const errorID = generateID()
    errorMap.set(errorID, [errorName, url])
    return errorID
  }

  this.get = (errorID) => {
    return errorMap.get(errorID) || []
  }

  this.delete = (errorID) => {
    const deleted = errorMap.delete(errorID)
    deleted ? debug(`errorinfo.js: delete ${errorID}`) : debug(`errorinfo.js: miss ${errorID}`)
    return deleted
  }

  return this
}
