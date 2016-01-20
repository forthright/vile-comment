let vile = require("@brentlintner/vile")
let wrench = require("wrench")
let ignore = require("ignore-file")

// TODO: put somewhere else (and override with user conf)
const SUPPORED_LANGS = new RegExp("\.(" + [
  "coffee",
  "ts",
  "js",
  "rb",
  "hs",
  "html",
  "css",
  "less",
  "sass",
  "scss",
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
// TODO: support these
const FIXME = /FIXME/i
const BUG = /BUG/i

let allowed_file = (plugin_config) => {
  // TODO: support windows
  var ignored = plugin_config.ignore ?
    ignore.compile(plugin_config.ignore.join("\n")) : () => false

  return (file) => {
    return file.match(SUPPORED_LANGS) && !ignored(file)
  }
}

// HACK: EPIC
// TODO: epic hack here

let read_lines = (filepath) => {
  const file = new wrench.LineReader(filepath)
  let lines = []
  while(file.hasNextLine()) { lines.push(file.getNextLine()) }
  return lines
}

let signature = (line) => {
  if (TODO.test(line)) {
    return `comment::TODO`
  } else if (HACK.test(line)) {
    return `comment::HACK`
  } else if (NOTE.test(line)) {
    return `comment::NOTE`
  }
}

// TODO: multiple issues if > 1 checks on same line
let issues = (filepath, lines) =>
  lines.reduce((found, line, idx) => {
    if (COMMENT.test(line)) {
      found.push(vile.issue({
        type: vile.MAIN,
        path: filepath,
        title: line,
        message: line,
        where: { start: { line: idx + 1, character: 0 } },
        signature: signature(line)
      }))
    }

    return found
  }, [])

let punish = (plugin_config) =>
  vile.promise_each(
    process.cwd(),
    allowed_file(plugin_config),
    (filepath) => issues(filepath, read_lines(filepath)),
    { read_data: false })

module.exports = {
  punish: punish
}
