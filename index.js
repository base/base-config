/*!
 * base-config <https://github.com/jonschlinkert/base-config>
 *
 * Copyright (c) 2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

var mapper = require('map-config');
var isObject = require('isobject');

module.exports = function() {
  return function(app) {
    var config = mapper(app)
      .map('data')
      .map('store', store(app.store))
      .map('option')
      .map('enable')
      .map('enabled')
      .map('disable')
      .map('disabled')
      .map('set')
      .map('del')
      .map('get')
      .map('has');

    app.define('config', proxy(config));
  };

  function store(app) {
    if (!app) return {};
    var config = mapper(app)
      .map('set')
      .map('del')
      .map('has')
      .map('get');

    app.define('config', config);
    return function(argv) {
      config.process(argv);
    };
  }
};

/**
 * Proxy to support config as a function and object
 * with methods, allowing the user to do either of
 * the following:
 *
 * ```js
 * base.config({
 *   foo: 'bar'
 * });
 *
 * // or
 * base.config.map('foo', 'bar');
 * ```
 */

function proxy(config) {
  function fn(key, val) {
    if (typeof val === 'string') {
      config.alias.apply(config, arguments);
      return config;
    }

    if (typeof key === 'string') {
      config.map.apply(config, arguments);
      return config;
    }

    if (!isObject(key)) {
      throw new TypeError('expected key to be a string or object');
    }

    for (var prop in key) {
      fn(prop, key[prop]);
    }
    return config;
  }
  fn.__proto__ = config;
  return fn;
}
