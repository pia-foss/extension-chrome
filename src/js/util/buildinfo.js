export default function(app) {
  const self = Object.assign(Object.create(null), {
    "name":      "@@buildname",
    "version":   "@@version",
    "date":      "@@dateofbuild",
    "debug":     "@@nodeEnvironment" !== "production",
    "coupon":    "@@coupon",
    "gitcommit": "@@gitcommit",
    "gitbranch": "@@gitbranch",
    "browser":   "@@browser"
  })

  return Object.freeze(self)
}
