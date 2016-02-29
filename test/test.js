'use strict';

require('mocha');
var assert = require('assert');
var minimist = require('minimist');
var base = require('base');
var store = require('base-store');
var data = require('base-data');
var plugins = require('base-plugins');
var options = require('base-option');
var expandArgs = require('expand-args');
var config = require('..');
var app;

function expand(argv) {
  return expandArgs(minimist(argv));
}

describe('base-config', function() {
  beforeEach(function() {
    app = base();
    app.use(plugins());
    app.use(store('base-config-tests'));
    app.use(config());
  });

  describe('methods', function() {
    it('should expose a "config" function on app:', function() {
      assert(app.config);
      assert.equal(typeof app.config, 'function');
    });

    it('should expose a "process" method on app.config:', function() {
      assert.equal(typeof app.config.process, 'function');
    });

    it('should expose a "map" method on app.config:', function() {
      assert.equal(typeof app.config.map, 'function');
    });
  });

  describe('config mapping', function() {
    it('should expose the config object from app.config', function() {
      assert(app.config.config);
      assert.equal(typeof app.config.config, 'object');
    });

    it('should add a set method to config', function() {
      assert.equal(typeof app.config.config.set, 'function');
    });
    it('should add a del method to config', function() {
      assert.equal(typeof app.config.config.del, 'function');
    });
  });

  describe('config function', function() {
    it('should map over an object', function(cb) {
      var keys = [];
      app.on('set', function(key) {
        keys.push(key);
      });

      app.config({foo: 'set', bar: 'set'});

      app.config.process({foo: 'b', bar: 'd'}, function(err) {
        if (err) cb(err);
        assert.equal(keys.length, 2);
        assert.equal(keys[0], 'b');
        assert.equal(keys[1], 'd');
        cb();
      });
    });
  });

  describe('map', function() {
    beforeEach(function() {
      app = base();
      app.use(plugins());
      app.use(options());
      app.use(store('base-config-tests'));
      app.use(config());
    });

    it('should be chainable', function(cb) {
      app.config.alias('a', 'b')
        .alias('b', 'c')
        .alias('c', 'set')
        .map('set')

      app.on('set', function(key, val) {
        assert(key);
        assert.equal(key, 'a');
        assert.equal(val, 'b');
        cb();
      });

      app.config.process({c: {a: 'b'}}, function(err) {
        if (err) return cb(err);
      });
    });

    it('should add properties to app.config', function(cb) {
      app.config.map('foo', 'set');
      app.config.map('bar', 'get');
      var called = 0;

      app.on('set', function(key, val) {
        assert(key);
        assert.equal(key, 'a');
        assert.equal(val, 'b');
        called++;
      });

      app.config.process({set: {a: 'b'}, get: 'a'}, function(err) {
        if (err) return cb(err);
        cb();
      });
    });
  });

  describe('store.map', function() {
    beforeEach(function() {
      app = base();
      app.use(plugins());
      app.use(options());
      app.use(store('base-config-tests'));
      app.use(config());
    });

    it('should expose `store.config', function() {
      assert(app.store.config);
      assert.equal(typeof app.store.config, 'function');
    });

    it('should not blow up if store plugin is not used', function() {
      var foo = base();
      foo.use(config());
      assert.equal(typeof foo.store, 'undefined');
    });
  });

  describe('process', function() {
    it('should process an object of flags', function(cb) {
      app.on('set', function(key, val) {
        assert(key);
        assert.equal(key, 'a');
        assert.equal(val, 'b');
        cb();
      });

      app.config.process({
        set: {
          a: 'b'
        }
      }, function(err) {
        if (err) return cb(err);
      });
    });
  });
});

describe('should handle methods added by other plugins', function() {
  beforeEach(function() {
    app = base();
    app.use(plugins());
    app.use(options());
    app.use(store('base-config-tests'));
    app.use(data());
    app.use(config());
  });

  afterEach(function() {
    app.store.del({
      force: true
    });
  });

  describe('store', function() {
    it('should add a store method to config', function() {
      assert.equal(typeof app.config.config.store, 'function');
    });
  });

  describe('option', function() {
    it('should add an option method to config', function() {
      assert.equal(typeof app.config.config.option, 'function');
    });
  });

  describe('data', function() {
    it('should add a data method to config', function() {
      assert.equal(typeof app.config.config.data, 'function');
    });
  });
});

describe('events', function() {
  beforeEach(function() {
    app = base();
    app.use(plugins());
    app.use(options());
    app.use(store('base-config-tests'));
    app.use(data());
    app.use(config());
  });

  afterEach(function() {
    app.store.del({
      force: true
    });
  });

  describe('set', function() {
    it('should emit a set event', function(cb) {
      var argv = expand(['--set=a:b']);

      app.on('set', function(key, val) {
        assert(key);
        assert(val);
        assert.equal(app.a, 'b');
        assert.equal(key, 'a');
        assert.equal(val, 'b');
        cb();
      });

      app.config.process(argv, function(err) {
        if (err) return cb(err);
      });
    });
  });

  describe('del', function() {
    it('should emit a del event', function(cb) {
      var argv = expand(['--del=a']);
      app.set('a', 'b');

      app.on('del', function(key) {
        assert(key);
        assert.equal(key, 'a');
        assert.equal(typeof app.a, 'undefined');
        cb();
      });

      app.config.process(argv, function(err) {
        if (err) return cb(err);
      });
    });
  });
});

describe('aliases', function() {
  beforeEach(function() {
    app = base();
    app.use(plugins());
    app.use(options());
    app.use(store('base-config-tests'));
    app.use(data());
    app.use(config());
  });

  afterEach(function() {
    app.store.del({
      force: true
    });
  });

  describe('config', function() {
    beforeEach(function() {
      app = base();
      app.use(plugins());
      app.use(options());
      app.use(store('base-config-tests'));
      app.use(data());
      app.use(config());
    });

    afterEach(function() {
      app.store.del({
        force: true
      });
    });

    it('should map an object to methods', function(cb) {
      var argv = expand(['--set=a:b']);
      app.config({
        set: 'set'
      });

      app.on('set', function(key, val) {
        assert(key);
        assert(val);
        assert.equal(app.a, 'b');
        assert.equal(key, 'a');
        assert.equal(val, 'b');
        cb();
      });

      app.config.process(argv, function(err) {
        if (err) return cb(err);
      });
    });

    it('should use custom functions', function(cb) {
      var argv = expand(['--foo=a:b']);
      app.config({
        set: 'set',
        foo: function(key, val) {
          app.set(key, val);
        }
      });

      app.on('set', function(key, val) {
        assert(key);
        assert(val);
        assert.equal(app.a, 'b');
        assert.equal(key, 'a');
        assert.equal(val, 'b');
        cb();
      });

      app.config.process(argv, function(err) {
        if (err) return cb(err);
      });
    });

    it('should use alias mappings', function(cb) {
      var argv = expand(['--foo=a:b']);
      app.config({
        set: 'set',
        foo: 'set'
      });

      app.on('set', function(key, val) {
        assert(key);
        assert(val);
        assert.equal(app.a, 'b');
        assert.equal(key, 'a');
        assert.equal(val, 'b');
        cb();
      });

      app.config.process(argv, function(err) {
        if (err) return cb(err);
      });
    });

    it('should expose config.map', function(cb) {
      var argv = expand(['--set=a:b']);
      app.config.map('set');

      app.on('set', function(key, val) {
        assert(key);
        assert(val);
        assert.equal(app.a, 'b');
        assert.equal(key, 'a');
        assert.equal(val, 'b');
        cb();
      });

      app.config.process(argv, function(err) {
        if (err) return cb(err);
      });
    });

    it('should expose config.alias', function(cb) {
      var argv = expand(['--set=a:b']);
      app.config.alias('foo', 'set');

      app.on('set', function(key, val) {
        assert(key);
        assert(val);
        assert.equal(app.a, 'b');
        assert.equal(key, 'a');
        assert.equal(val, 'b');
        cb();
      });

      app.config.process(argv, function(err) {
        if (err) return cb(err);
      });
    });

    it('should throw if args are invalid', function(cb) {
      try {
        app.config([]);
        cb(new Error('expected an error'));
      } catch (err) {
        assert(err);
        assert(err.message);
        assert.equal(err.message, 'expected key to be a string or object');
        cb();
      }
    });
  });
});