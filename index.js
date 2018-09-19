const parseArgs = require("minimist")
const path = require("path")

const argv = parseArgs(process.argv.slice(2))

console.log(argv)

const url = argv["u"] || argv["url"] || "github.com"
const package = argv["p"] || argv["package"] || "yahwastaken/holdmybeer"
const branch = argv["b"] || argv["branch"] || "master"
const scope = argv["s"] || argv["scope"] || "@nbarray"

console.log(JSON.stringify({
  url,
  package,
  branch,
  scope,
  endpoint: `https://${path.join(url, package)}`
}, null, 2))



