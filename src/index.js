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

let to_issue_message = (line) => {
  let msg = []

  // TODO: this is stupid
  if (TODO.test(line)) msg.push("TODO")
  if (HACK.test(line)) msg.push("HACK")
  if (NOTE.test(line)) msg.push("NOTE")
  if (FIXME.test(line)) msg.push("FIXME")
  if (BUG.test(line)) msg.push("BUG")

  return `(${msg.join(",")}) - ${line}`
}

let issues = (filepath, lines) => {
  var errors = lines.reduce((found, line, idx) => {
    // TODO: support choosing type of checks
    // TODO: multiple issues if > 1 checks on same line
    if (COMMENT.test(line)) {
      found.push(vile.issue(
        vile.WARNING,
        filepath,
        to_issue_message(line),
        { line: idx + 1, character: 0 }
      ))
    }

    return found
  }, [])

  return errors.length > 0 ?
    errors : [ vile.issue(vile.OK, filepath) ]
}

let punish = (plugin_config) => {
  return vile.promise_each(
    process.cwd(),
    allowed_file(plugin_config),
    // TODO: use method that only gets files, not reads?
    (filepath, data) => {
      let lines = read_lines(filepath)
      return issues(filepath, lines)
    }
  )
}

module.exports = {
  punish: punish
}
