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
// TODO: be able to specify types of comments to check via config
// TODO: support these
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

var signature = function signature(line) {
  if (TODO.test(line)) {
    return "comment::TODO";
  } else if (HACK.test(line)) {
    return "comment::HACK";
  } else if (NOTE.test(line)) {
    return "comment::NOTE";
  }
};

var issues = function issues(filepath, lines) {
  var errors = lines.reduce(function (found, line, idx) {
    // TODO: support choosing type of checks
    // TODO: multiple issues if > 1 checks on same line
    if (COMMENT.test(line)) {
      found.push(vile.issue({
        type: vile.MAIN,
        path: filepath,
        title: line,
        message: line,
        where: { start: { line: idx + 1, character: 0 } },
        signature: signature(line)
      }));
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