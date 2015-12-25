"use strict";

var Task = require("data.task");

/* Parse */
var Parse = require("parse/node");
var Pr = Parse.Promise;
var all = function all() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  return Pr.when.apply(Pr.when, args);
};
var doResolve = function doResolve(val) {
  return Pr.as(val);
};
var doReject = function doReject(err) {
  return Pr.error(err);
};

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
/* Utility */
var isArray = Array.isArray;
var slice = Array.prototype.slice;
var isPromise = function isPromise(val) {
  return val instanceof Parse.Promise;
};
var applyArray = function applyArray() {
  for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    args[_key2] = arguments[_key2];
  }

  return slice.call(args);
};
var promisify = function promisify(val) {
  return isArray(val) ? all(val).then(applyArray) : !isPromise(val) ? doResolve(val) : val;
};
var promisifyAll = function promisifyAll(items) {
  return items ? isArray(items) ? all(map(promisify, items)) : promisify(items) : items;
};

module.exports = {
  fromPromise: function fromPromise(p) {
    return new Task(function (reject, resolve) {
      return p.then(resolve).fail(reject);
    });
  },
  of: function of(b) {
    return new Task(function (_, resolve) {
      return promisifyAll(b).then(resolve);
    });
  },
  rejected: function rejected(a) {
    return new Task(function (reject) {
      return promisifyAll(a).then(doReject).fail(reject);
    });
  }
};