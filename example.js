'use strict';

var base = require('base-methods');
var config = require('./');

var app = base()
  .use(config())

app.config({
  s: 'set',
  g: 'get',
  h: 'has',
  d: 'del'
});

app.on('set', function (val, key) {
  console.log('set:', val, key);
});

// pass a config object to process.
app.config.process({s: {a: 'b', c: 'd'}});
// (we can be creative! this could be an object
// from package.json, argv, config store, etc!)
