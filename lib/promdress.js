
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = ƤromƊress;

function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

function ƤromƊress(Parse) {

  /* Parse */
  var P = Parse.Promise;
  var allApply = function allApply() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return P.when.apply(P, args);
  };
  var resolve = P.as;
  var reject = P.error;

  /* helpers */

  var _func = function _func(fn) {
    return typeof fn === "function";
  };
  var _ap = function _ap(fn) {
    return function (args) {
      return fn.apply(null, args);
    };
  };
  var _np = function _np() {};

  var thenApply = function thenApply(prms, cbs) {

    if (!cbs.length) {
      return prms;
    }

    return prms.then.apply(prms, cbs);
  };

  var wrapAndCallbackPromises = function wrapAndCallbackPromises(prms, fn, cbs) {
    return _ap(_ap(fn)(prms))(cbs);
  };

  /**
   * wraps a function to accept promises as arguments or wraps arguments as promise
   *
   * If first passed function(s) - they will be the callbacks
   * returns a function which when called wraps it's arguments in promises
   * and then resolves them to these functions: success,[error]
   *
   * If first passed non-functions - they will be the promises
   * returns a function which applies it's arguments to the promise's then
   *
   * aliases: `when`, `then`
   *
   * changes this:
   * ```
   *
   *  getAsyncResults("using a normal promise chain")
   *    .then(processSync)
   *    .then(queryAsync)
   *    .then(formatSync)
   *    .then(log);
   *
   * ```
   * to this:
   * ```
   *
   *  const results = getAsyncResults("using when and then futures");
   *  const processed = then(processSync)(results);
   *  const queried = then(queryAsync)(processed);
   *  const formatted = then(formatSync)(queried);
   *
   *  when(formatted)(log);
   *
   * ```
   * @returns {Function|Parse.Promise}
   */
  function future() {
    for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    if (!args.length) {
      return future;
    }

    if (_func(args[0])) {
      var _ret = (function () {

        var callbacks = args;
        var callbackPromises = function callbackPromises() {
          for (var _len3 = arguments.length, prms = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
            prms[_key3] = arguments[_key3];
          }

          return prms.length ? wrapAndCallbackPromises(prms, future, callbacks) : callbackPromises;
        };

        return {
          v: callbackPromises
        };
      })();

      if ((typeof _ret === "undefined" ? "undefined" : _typeof(_ret)) === "object") return _ret.v;
    }

    var prms = allApply(args);

    return function () {
      for (var _len4 = arguments.length, cbs = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
        cbs[_key4] = arguments[_key4];
      }

      if (cbs.length > 1) {
        cbs[1] = args.length < 2 ? _ap(cbs[1]) : cbs[1];
      }
      return thenApply(prms, cbs);
    };
  }

  /* future aliases */

  var when = future;
  var then = future;

  /**
   * like Parse.Promise `always` in that it applies a single callback to both resolutions and rejections
   *
   * it does differ however in two ways:
   *
   * 1. still allows an error function (like a logger) to receive the error
   * 2. wraps return on failure in a Parse.Promise `as` effectively ignoring the error
   *
   * usage:
   * ```
   *  const good = result => new Promise().resolve(result);
   *  const bad = error => new Promise().reject(error);
   *
   *  const onSuccess = () => true
   *  const onError = (err) => { console.log(err); return false; }
   *
   *  let a = always(good("..."))(onSuccess, onError)   // -> true
   *  let b = always(bad("error"))(onSuccess, onError)  // -> true (logs "error")
   *  let c = always(onSuccess)(good("..."));           // -> true
   *  let d = always(onSuccess)(bad("error"));          // -> true
   *
   * ```
   * @returns {Function|Parse.Promise}
   */
  function always() {
    for (var _len5 = arguments.length, args = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
      args[_key5] = arguments[_key5];
    }

    if (!args.length) {
      return always;
    }

    if (_func(args[0])) {
      var _ret2 = (function () {
        var callbacks = args;
        var callbackPromises = function callbackPromises() {
          for (var _len6 = arguments.length, prms = Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
            prms[_key6] = arguments[_key6];
          }

          return prms.length ? wrapAndCallbackPromises(prms, always, callbacks) : callbackPromises;
        };
        return {
          v: callbackPromises
        };
      })();

      if ((typeof _ret2 === "undefined" ? "undefined" : _typeof(_ret2)) === "object") return _ret2.v;
    }

    var prms = allApply(args);
    return function () {
      for (var _len7 = arguments.length, cbs = Array(_len7), _key7 = 0; _key7 < _len7; _key7++) {
        cbs[_key7] = arguments[_key7];
      }

      if (!cbs.length) {
        return prms;
      }

      var both = _ap(_ap(cbs[0]));
      var errh = _ap(cbs.length > 1 ? args.length < 2 ? _ap(cbs[1]) : cbs[1] : _np);

      cbs[1] = function () {
        for (var _len8 = arguments.length, errors = Array(_len8), _key8 = 0; _key8 < _len8; _key8++) {
          errors[_key8] = arguments[_key8];
        }

        errh(errors);
        return resolve(both(errors));
      };

      return thenApply(prms, cbs);
    };
  }

  /**
   *
   * @param args
   * @returns {*}
   */
  function catches() {
    for (var _len9 = arguments.length, args = Array(_len9), _key9 = 0; _key9 < _len9; _key9++) {
      args[_key9] = arguments[_key9];
    }

    if (!args.length) {
      return catches;
    }

    if (_func(args[0])) {
      var _ret3 = (function () {

        var callbacks = args;
        var callbackPromises = function callbackPromises() {
          for (var _len10 = arguments.length, prms = Array(_len10), _key10 = 0; _key10 < _len10; _key10++) {
            prms[_key10] = arguments[_key10];
          }

          return prms.length ? wrapAndCallbackPromises(prms, catches, callbacks) : callbackPromises;
        };
        return {
          v: callbackPromises
        };
      })();

      if ((typeof _ret3 === "undefined" ? "undefined" : _typeof(_ret3)) === "object") return _ret3.v;
    }

    var prms = allApply(args);

    return function () {
      for (var _len11 = arguments.length, cbs = Array(_len11), _key11 = 0; _key11 < _len11; _key11++) {
        cbs[_key11] = arguments[_key11];
      }

      if (!cbs.length) {
        return prms;
      }

      var cb = args.length < 2 ? _ap(cbs[0]) : cbs[0];

      return prms.fail(cb);
    };
  }

  /**
   * compose all function (async and sync) arguments into a future function
   *
   * ```
   *    var format = compose(formatSync, queryAsync, processSync)
   *
   *    var loaded = when(getAsyncResults())
   *
   *    var formatted = loaded(format)
   *
   *    // or...
   *
   *    var others = getAsyncResults()
   *
   *    var otherFormatted = when(others)(format)
   *
   * ``
   * @returns {Function}
   */
  function compose() {
    for (var _len12 = arguments.length, fns = Array(_len12), _key12 = 0; _key12 < _len12; _key12++) {
      fns[_key12] = arguments[_key12];
    }

    return _ap(_compose)(_map(future, fns));
  }

  /**
   * helper compose function
   * @param fns
   * @returns {Function}
   */
  function _compose() {
    var _this = this;

    for (var _len13 = arguments.length, fns = Array(_len13), _key13 = 0; _key13 < _len13; _key13++) {
      fns[_key13] = arguments[_key13];
    }

    var start = fns.length - 1;

    return function () {
      for (var _len14 = arguments.length, args = Array(_len14), _key14 = 0; _key14 < _len14; _key14++) {
        args[_key14] = arguments[_key14];
      }

      var i = start;
      var result = fns[start].apply(_this, args);
      while (i--) {
        result = fns[i].call(_this, result);
      }
      return result;
    };
  }

  /**
   * helper map
   * @param fn
   * @param subject
   * @returns {Array}
   * @private
   */
  function _map(fn, subject) {
    var i = -1;
    var len = subject && subject.length || 0;
    var result = new Array(len);
    while (++i < len) {
      result[i] = fn(subject[i], i);
    }
    return result;
  }

  return {

    resolve: resolve,
    reject: reject,
    future: future,
    when: when,
    then: then,
    always: always,
    catches: catches,
    compose: compose
  };
}