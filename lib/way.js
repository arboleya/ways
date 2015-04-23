var u = 'undefined', o = 'object';
(function (klass){
  o === typeof exports ? module.exports = klass : 
  o === typeof Package && Package.meteor ? WaysWay = klass : 
  this.WaysWay = klass;
})(_module());

function _module() {
  'use strict';

  var _params_regex = {
    named: /:\w+/g,
    splat: /\*\w+/g,
    optional: /\/(?:\:|\*)(\w+)\?/g
  };

  function Way(pattern, runner, destroyer, dependency) {

    this.matcher = null;
    this.pattern = pattern;
    this.runner = runner;
    this.destroyer = destroyer;
    this.dependency = dependency;

    var _params_regex = {
      named: /:\w+/g,
      splat: /\*\w+/g,
      optional: /\/(\:|\*)(\w+)\?/g
    };

    if (pattern === '*') {
      this.matcher = /.*/;
    } else {
      this.matcher = pattern.replace(_params_regex.optional, '(?:\/)?$1$2?');
      this.matcher = this.matcher.replace(_params_regex.named, '([^\/]+)');
      this.matcher = this.matcher.replace(_params_regex.splat, '(.*?)');
      this.matcher = new RegExp("^" + this.matcher + "$", 'm');
    }
  };

  Way.prototype.extract_params = function(url) {
    var name, names, params, vals, i, len;

    names = this.pattern.match(/(?::|\*)(\w+)/g);
    if (names == null) return {};

    vals = url.match(this.matcher);
    params = {};
    for (i = 0, len = names.length; i < len; i++) {
      name = names[i];
      params[name.substr(1)] = vals[i+1];
    }

    return params;
  };

  Way.prototype.rewrite_pattern = function(pattern, url) {
    var key, value, reg, params;

    params = this.extract_params(url);
    for (key in params) {
      value = params[key];
      reg = new RegExp("[\:\*]+" + key, 'g');
      pattern = pattern.replace(reg, value);
    }
    return pattern;
  };

  Way.prototype.computed_dependency = function(url) {
    return this.rewrite_pattern(this.dependency, url);
  };

  Way.prototype.run = function(url, done) {
    var req = {
      url: url,
      pattern: this.pattern,
      params: this.extract_params(url)
    };
    this.runner(req, done);
    return req;
  };

  Way.prototype.destroy = function(req, done) {
    this.destroyer(req, done);
  };

  return Way;
};