
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
function ƤromƊress(Parse) {
  var _this = this;

  /* Parse */
  var Pr = Parse.Promise;
  var all = function all() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return Pr.when.apply(Pr.when, args);
  };
  var resolve = function resolve(val) {
    return Pr.as(val);
  };
  var reject = function reject(err) {
    return Pr.error(err);
  };

  /* Utility */
  var isArray = Array.isArray;
  var identity = function identity(id) {
    return id;
  };
  var slice = Array.prototype.slice;

  function compose() {
    for (var _len2 = arguments.length, fns = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      fns[_key2] = arguments[_key2];
    }

    var start = fns.length - 1;
    return function () {
      var i = start;

      for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        args[_key3] = arguments[_key3];
      }

      var result = fns[start].apply(this, args);
      while (i--) {
        result = fns[i].call(this, result);
      }
      return result;
    };
  }

  function flatten(items) {
    var len = items.length;
    var result = [],
        i = -1;
    while (++i < len) {
      result.push.apply(result, isArray(items[i]) ? flatten(items[i]) : [items[i]]);
    }
    return result;
  }

  function map(fn, items) {
    if (!items) {
      return function (i) {
        return map(fn, i);
      };
    }
    var len = items.length;
    var result = new Array(len);
    var i = -1;
    while (++i < len) {
      result[i] = fn(items[i]);
    }
    return result;
  }

  var isPromise = function isPromise(val) {
    return val instanceof Parse.Promise;
  };

  var applyArray = function applyArray() {
    for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
      args[_key4] = arguments[_key4];
    }

    return slice.call(args);
  };

  var promisify = function promisify(val) {
    return isArray(val) ? all(val).then(applyArray) : !isPromise(val) ? resolve(val) : val;
  };

  var promisifyAll = function promisifyAll(items) {
    return items && items.length ? all(map(promisify, items)) : items;
  };

  var nullFilter = function nullFilter(item) {
    return item !== null && typeof item !== "undefined";
  };

  var errorArgs = function errorArgs(result) {
    return flatten(slice.call(result)).filter(nullFilter);
  };

  var resolveCallbacks = function resolveCallbacks(prms) {
    return function (resolved, rejected) {

      return promisifyAll(prms).then(function () {
        for (var _len5 = arguments.length, args = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
          args[_key5] = arguments[_key5];
        }

        return promisify(resolved.apply(_this, args));
      }).fail(function (errors) {
        return (rejected || identity)(errorArgs(errors));
      });
    };
  };

  var resolveCatches = function resolveCatches(prms) {
    return function (rejected) {
      return promisifyAll(prms).fail(function (errors) {
        return rejected(errorArgs(errors));
      });
    };
  };

  var resolveAlways = function resolveAlways(prms) {
    return function (resolved) {

      return promisifyAll(prms).then(function () {
        for (var _len6 = arguments.length, args = Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
          args[_key6] = arguments[_key6];
        }

        return promisify(resolved.apply(_this, args));
      }).fail(function (errors) {
        return resolve(resolved(errorArgs(errors)));
      });
    };
  };

  var always = function always(resolved) {
    return function () {
      for (var _len7 = arguments.length, prms = Array(_len7), _key7 = 0; _key7 < _len7; _key7++) {
        prms[_key7] = arguments[_key7];
      }

      return resolveAlways(prms)(resolved);
    };
  };

  var alwaysWhen = function alwaysWhen() {
    for (var _len8 = arguments.length, prms = Array(_len8), _key8 = 0; _key8 < _len8; _key8++) {
      prms[_key8] = arguments[_key8];
    }

    return resolveAlways(prms);
  };

  var catches = function catches(rejected) {
    return function () {
      for (var _len9 = arguments.length, prms = Array(_len9), _key9 = 0; _key9 < _len9; _key9++) {
        prms[_key9] = arguments[_key9];
      }

      return resolveCatches(prms)(rejected);
    };
  };

  var unless = function unless() {
    for (var _len10 = arguments.length, prms = Array(_len10), _key10 = 0; _key10 < _len10; _key10++) {
      prms[_key10] = arguments[_key10];
    }

    return resolveCatches(prms);
  };

  var when = function when() {
    for (var _len11 = arguments.length, prms = Array(_len11), _key11 = 0; _key11 < _len11; _key11++) {
      prms[_key11] = arguments[_key11];
    }

    return resolveCallbacks(prms);
  };

  var then = function then(resolved, rejected) {
    return function () {
      for (var _len12 = arguments.length, prms = Array(_len12), _key12 = 0; _key12 < _len12; _key12++) {
        prms[_key12] = arguments[_key12];
      }

      return resolveCallbacks(prms)(resolved, rejected);
    };
  };

  var spreadTo = function spreadTo(fn) {
    return function () {
      for (var _len13 = arguments.length, args = Array(_len13), _key13 = 0; _key13 < _len13; _key13++) {
        args[_key13] = arguments[_key13];
      }

      return fn.apply(_this, flatten(args));
    };
  };

  var concatTo = function concatTo(fn) {
    return function () {
      for (var _len14 = arguments.length, args = Array(_len14), _key14 = 0; _key14 < _len14; _key14++) {
        args[_key14] = arguments[_key14];
      }

      return fn.call(_this, flatten(args));
    };
  };

  return {
    all: all,
    always: always,
    alwaysWhen: alwaysWhen,
    catches: catches,
    compose: compose,
    concatTo: concatTo,
    flatten: flatten,
    map: map,
    spreadTo: spreadTo,
    resolve: resolve,
    reject: reject,
    then: then,
    unless: unless,
    when: when
  };
}

exports.default = ƤromƊress;