
"use strict"

export default function ƤromƊress(Parse){

  /* Parse */
  const P = Parse.Promise
  const allApply = (...args) => { return P.when.apply(P, args) }
  const resolve = P.as
  const reject = P.error

  /* helpers */

  const _func = (fn) => { return typeof(fn) === "function" }
  const _ap = (fn) => (args) => { return fn.apply(null, args) }
  const _np = () => {}

  const thenApply = (prms, cbs) => {

    if (!cbs.length){ return prms }

    return prms.then.apply(prms, cbs)
  }

  const wrapAndCallbackPromises = (prms, fn, cbs) => { return _ap(_ap(fn)(prms))(cbs) }

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
  function future(...args){

    if (!args.length){ return future }

    if (_func(args[0])){

      const callbacks = args
      const callbackPromises = (...prms) => {

        return prms.length ? wrapAndCallbackPromises(prms, future, callbacks) : callbackPromises
      }

      return callbackPromises
    }

    const prms = allApply(args)

    return (...cbs) => {
      if (cbs.length > 1){ cbs[1] = args.length < 2 ? _ap(cbs[1]) : cbs[1] }
      return thenApply(prms, cbs)
    }
  }

  /* future aliases */

  const when = future
  const then = future

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
  function always(...args){

    if (!args.length){ return always }

    if (_func(args[0])){
      const callbacks = args
      const callbackPromises = (...prms) => {
        return prms.length ? wrapAndCallbackPromises(prms, always, callbacks) : callbackPromises
      }
      return callbackPromises
    }

    const prms = allApply(args)
    return (...cbs) => {

      if (!cbs.length){ return prms }

      const both = _ap(_ap(cbs[0]))
      const errh = _ap((cbs.length > 1) ? (args.length < 2 ? _ap(cbs[1]) : cbs[1]) : _np)

      cbs[1] = (...errors) => {

        errh(errors)
        return resolve(both(errors))
      }

      return thenApply(prms, cbs)
    }
  }

  /**
   *
   * @param args
   * @returns {*}
   */
  function catches(...args){

    if (!args.length){ return catches }

    if (_func(args[0])){

      const callbacks = args
      const callbackPromises = (...prms) => {
        return prms.length ? wrapAndCallbackPromises(prms, catches, callbacks) : callbackPromises
      }
      return callbackPromises
    }

    const prms = allApply(args)

    return (...cbs) => {

      if (!cbs.length){ return prms }

      const cb = args.length < 2 ? _ap(cbs[0]) : cbs[0]

      return prms.fail(cb)
    }
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
  function compose(...fns){

    return _ap(_compose)(_map(future, fns))
  }

  /**
   * helper compose function
   * @param fns
   * @returns {Function}
   */
  function _compose(...fns) {

    const start = fns.length - 1

    return (...args) => {
      let i = start
      let result = fns[start].apply(this, args)
      while (i--) {
        result = fns[i].call(this, result)
      }
      return result
    }
  }

  /**
   * helper map
   * @param fn
   * @param subject
   * @returns {Array}
   * @private
   */
  function _map(fn, subject) {
    let i = -1
    const len = subject && subject.length || 0
    const result = new Array(len)
    while (++i < len) {
      result[i] = fn(subject[i], i)
    }
    return result
  }


  return {

    resolve,
    reject,
    future,
    when,
    then,
    always,
    catches,
    compose
  }
}
