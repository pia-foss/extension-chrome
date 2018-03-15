export default function(app) {
  const self  = this,
        table = {}

  self.get = (member) => table[member] || 0
  self.inc = (member) => table[member] = (table[member] || 0) + 1
  self.del = (member) => delete(table[member])

  return self
}
