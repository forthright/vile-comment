"use strict";

var vile = require("@brentlintner/vile");
var wrench = require("wrench");
var ignore = require("ignore-file");

// TODO: put somewhere else (and override with user conf)
var SUPPORED_LANGS = new RegExp("\.(" + ["coffee", "ts", "js", "rb", "hs", "html", "css", "less", "sass", "scss", "styl", "jade"].join("|") + ")$");

// TODO: support <!--
// TODO: only test lang comment regex vs a catch all for each file type
// TODO: support multiline comments (/**/ and //\n//...)
var COMMENT = /(\/\/|\#|\/\*|\-\-)\s{0,}(TODO|NOTE|HACK)/i;
var HACK = /HACK/i;
var TODO = /TODO/i;
var NOTE = /NOTE/i;
var FIXME = /FIXME/i;
var BUG = /BUG/i;

var allowed_file = function allowed_file(plugin_config) {
  // TODO: support windows
  var ignored = plugin_config.ignore ? ignore.compile(plugin_config.ignore.join("\n")) : function () {
    return false;
  };

  return function (file) {
    return file.match(SUPPORED_LANGS) && !ignored(file);
  };
};

// HACK: EPIC
// TODO: epic hack here

var read_lines = function read_lines(filepath) {
  var file = new wrench.LineReader(filepath);
  var lines = [];
  while (file.hasNextLine()) {
    lines.push(file.getNextLine());
  }
  return lines;
};

var to_issue_message = function to_issue_message(line) {
  var msg = [];

  // TODO: this is stupid
  if (TODO.test(line)) msg.push("TODO");
  if (HACK.test(line)) msg.push("HACK");
  if (NOTE.test(line)) msg.push("NOTE");
  if (FIXME.test(line)) msg.push("FIXME");
  if (BUG.test(line)) msg.push("BUG");

  return "(" + msg.join(",") + ") - " + line;
};

var issues = function issues(filepath, lines) {
  var errors = lines.reduce(function (found, line, idx) {
    // TODO: support choosing type of checks
    // TODO: multiple issues if > 1 checks on same line
    if (COMMENT.test(line)) {
      found.push(vile.issue(vile.WARNING, filepath, to_issue_message(line), { line: idx + 1, character: 0 }));
    }

    return found;
  }, []);

  return errors.length > 0 ? errors : [vile.issue(vile.OK, filepath)];
};

var punish = function punish(plugin_config) {
  return vile.promise_each(process.cwd(), allowed_file(plugin_config),
  // TODO: use method that only gets files, not reads?
  function (filepath, data) {
    var lines = read_lines(filepath);
    return issues(filepath, lines);
  });
};

module.exports = {
  punish: punish
};