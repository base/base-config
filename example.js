'use strict';

var store = require('data-store');
var expand = require('expand-args');
var argv = require('minimist')(process.argv.slice(2), {
  alias: {set: 's', get: 'g', del: 'd'}
});
var base = require('base-methods');
var option = require('base-options');
var data = require('base-data');
var config = require('./');
var app = base()
  .define('store', store('base-config-test'))
  .use(option)
  .use(data())
  .use(config())

// app.config({
//   get: 'get',
//   set: 'set'
// });
app.config.map('set')
app.config.map('get')

app.on('option', function (val, key) {
  console.log('option:', val, key);
});

app.store.on('set', function (val, key) {
  console.log('set:', val, key);
});
app.store.on('get', function (val, key) {
  console.log('get:', val, key);
});
app.store.on('del', function (key) {
  console.log('deleted:', key);
});

app.on('get', console.log);
app.on('has', console.log);
app.config.process(expand(argv));
console.log(app.config)

// app.config.help();
// console.log(app.config)

