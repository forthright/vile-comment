let vile = require("vile")
let _ = require("lodash")
let linez = require("linez")

// TODO: put somewhere else (and override with user conf)
const SUPPORED_LANGS = new RegExp("\.(" + [
  "coffee",
  "ts",
  "js",
  "rb",
  "hs",
  "html",
  "css",
  "scala",
  "php",
  "py",
  "less",
  "sass",
  "scss",
  "slim",
  "styl",
  "jade"
].join("|") + ")$")

// TODO: support <!--
// TODO: only test lang comment regex vs a catch all for each file type
// TODO: support multiline comments (/**/ and //\n//...)
const COMMENT = /(\/\/|\#|\/\*|\-\-)\s{0,}(TODO|NOTE|HACK)/i
const HACK = /HACK/i
const TODO = /TODO/i
const NOTE = /NOTE/i
// TODO: be able to specify types of comments to check via config
// TODO: support things like FIXME/BUG

let allowed_file = (ignore) =>
  (file, is_dir) =>
    (is_dir || file.match(SUPPORED_LANGS)) &&
      !vile.ignored(file, ignore)

let signature = (line) => {
  if (TODO.test(line)) {
    return `comment::TODO::${line}`
  } else if (HACK.test(line)) {
    return `comment::HACK::${line}`
  } else if (NOTE.test(line)) {
    return `comment::NOTE::${line}`
  }
}

let issues = (filepath, lines) =>
  _.reduce(lines, (found, linez_line) => {
    const line = linez_line.text
    if (COMMENT.test(line)) {
      found.push(vile.issue({
        type: vile.MAIN,
        path: filepath,
        message: line,
        where: { start: { line: linez_line.number } },
        signature: signature(line)
      }))
    }
    return found
  }, [])

let punish = (plugin_config) =>
  vile.promise_each(
    process.cwd(),
    allowed_file(_.get(plugin_config, "ignore")),
    (filepath, data) =>
      issues(filepath, linez(data).lines))

module.exports = {
  punish: punish
}
