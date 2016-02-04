'use strict';

var argv = require('minimist')(process.argv.slice(2));
var expand = require('expand-args');
var base = require('base');
var config = require('./');

var app = base()
  .use(config())

app.config({
  s: 'set',
  g: 'get',
  h: 'has',
  d: 'del'
});

app.on('set', function(val, key) {
  console.log('set:', val, key);
});

// pass a config object to process.
// (we can be creative! this could be an object
// from package.json, argv, config store, etc!)
// app.config.process({s: {a: 'b', c: 'd'}});
app.config.process(expand(argv), function(err) {
  if (err) throw err;
});
