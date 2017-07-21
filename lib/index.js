"use strict";

var vile = require("vile");
var _ = require("lodash");
var linez = require("linez");

// TODO: put somewhere else (and override with user conf)
var SUPPORED_LANGS = new RegExp("\.(" + ["coffee", "ts", "js", "rb", "hs", "html", "css", "scala", "php", "py", "less", "sass", "scss", "slim", "styl", "jade"].join("|") + ")$");

// TODO: support <!--
// TODO: only test lang comment regex vs a catch all for each file type
// TODO: support multiline comments (/**/ and //\n//...)
var COMMENT = /(\/\/|\#|\/\*|\-\-)\s{0,}(TODO|NOTE|HACK)/i;
var HACK = /HACK/i;
var TODO = /TODO/i;
var NOTE = /NOTE/i;
// TODO: be able to specify types of comments to check via config
// TODO: support things like FIXME/BUG

var allowed_file = function allowed_file(ignore) {
  return function (file, is_dir) {
    return (is_dir || file.match(SUPPORED_LANGS)) && !vile.ignored(file, ignore);
  };
};

var signature = function signature(line) {
  if (TODO.test(line)) {
    return "comment::TODO::" + line;
  } else if (HACK.test(line)) {
    return "comment::HACK::" + line;
  } else if (NOTE.test(line)) {
    return "comment::NOTE::" + line;
  }
};

var issues = function issues(filepath, lines) {
  return _.reduce(lines, function (found, linez_line) {
    var line = linez_line.text;
    if (COMMENT.test(line)) {
      found.push(vile.issue({
        type: vile.MAIN,
        path: filepath,
        message: line,
        where: { start: { line: linez_line.number } },
        signature: signature(line)
      }));
    }
    return found;
  }, []);
};

var punish = function punish(plugin_config) {
  return vile.promise_each(process.cwd(), allowed_file(_.get(plugin_config, "ignore")), function (filepath, data) {
    return issues(filepath, linez(data).lines);
  });
};

module.exports = {
  punish: punish
};