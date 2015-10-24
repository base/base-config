/*!
 * base-config <https://github.com/jonschlinkert/base-config>
 *
 * Copyright (c) 2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

var map = require('map-config');

module.exports = function(method) {
  method || (method = 'config');

  return function plugin(app) {
    var mapper = map(app);
    var fn = store(app.store);
    console.log(fn.process)
    mapper.alias('show', 'get')
      // .map('store', store(app.store))
      .map('store', fn)
      .map('option')
      .map('data')
      .map('set')
      .map('del')
      .map('get')
      .map('has');

    app.mixin(method, proxy(mapper));
    return app;
  };

  function store(app) {
    var config = map(app)
      .alias('show', 'get')
      .map('set')
      .map('del')
      .map('has')
      .map('get');

    return function(argv) {
      config.process(argv);
    };
  }
};

function proxy(mapper) {
  function config(key, value) {
    if (typeof key === 'string') {
      mapper.map.apply(mapper, arguments);

    } else if (key && typeof key === 'object') {
      for (var prop in key) {
        config(prop, key[prop]);
      }
    }
    return mapper;
  }
  config.__proto__ = mapper;
  return config;
}
