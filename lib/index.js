"use strict";

var vile = require("@forthright/vile");
var _ = require("lodash");
var wrench = require("wrench");

// TODO: put somewhere else (and override with user conf)
var SUPPORED_LANGS = new RegExp("\.(" + ["coffee", "ts", "js", "rb", "hs", "html", "css", "scala", "php", "py", "less", "sass", "scss", "styl", "jade"].join("|") + ")$");

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

var allowed_file = function allowed_file(ignore) {
  return function (file, is_dir) {
    return (is_dir || file.match(SUPPORED_LANGS)) && !vile.ignored(file, ignore);
  };
};

var read_lines = function read_lines(filepath) {
  var file = new wrench.LineReader(filepath);
  var lines = [];
  while (file.hasNextLine()) {
    lines.push(file.getNextLine());
  }
  return lines;
};

var signature = function signature(line, loc) {
  if (TODO.test(line)) {
    return "comment::TODO::" + loc;
  } else if (HACK.test(line)) {
    return "comment::HACK::" + loc;
  } else if (NOTE.test(line)) {
    return "comment::NOTE::" + loc;
  }
};

var issues = function issues(filepath, lines) {
  return lines.reduce(function (found, line, idx) {
    if (COMMENT.test(line)) {
      found.push(vile.issue({
        type: vile.MAIN,
        path: filepath,
        title: line,
        message: line,
        where: { start: { line: idx + 1, character: 0 } },
        signature: signature(line, idx + 1)
      }));
    }

    return found;
  }, []);
};

var punish = function punish(plugin_config) {
  return vile.promise_each(process.cwd(), allowed_file(_.get(plugin_config, "ignore")), function (filepath) {
    return issues(filepath, read_lines(filepath));
  }, { read_data: false });
};

module.exports = {
  punish: punish
};