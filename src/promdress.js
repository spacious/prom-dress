
"use strict"

function ƤromƊress(Parse){

  /* Parse */
  const Pr = Parse.Promise
  const all = (...args) => Pr.when.apply(Pr.when, args)
  const resolve = (val) => Pr.as(val)
  const reject = (err) => Pr.error(err)

  /* Utility */
  const isArray = Array.isArray
  const identity = (id => id)
  const slice = Array.prototype.slice

  function compose(...fns) {
    const start = fns.length - 1
    return function(...args){
      let i = start
      let result = fns[start].apply(this, args)
      while (i--) {
        result = fns[i].call(this, result)
      }
      return result
    }
  }

  function flatten(items){
    const len = items.length
    let result = [], i = -1
    while (++i < len){ result.push.apply(result, isArray(items[i]) ? flatten(items[i]) : [items[i]]) }
    return result
  }

  function map(fn, items){
    if (!items){ return (i) => map(fn, i) }
    const len = items.length
    const result = new Array(len)
    let i = -1
    while (++i < len){ result[i] = fn(items[i]) }
    return result
  }

  const isPromise = val => (val instanceof Parse.Promise)

  const applyArray = (...args) => slice.call(args)

  const promisify = val => isArray(val) ? all(val).then(applyArray) : !isPromise(val) ? resolve(val) : val

  const promisifyAll = items => items && items.length ? all(map(promisify, items)) : items

  const nullFilter = item => (item !== null && typeof item !== "undefined")

  const errorArgs = result => flatten(slice.call(result)).filter(nullFilter)

  const resolveCallbacks = prms => (resolved, rejected) => {

    return promisifyAll(prms)
      .then((...args) => promisify(resolved.apply(this, args)))
      .fail(errors => (rejected || identity)(errorArgs(errors)))
  }

  const resolveCatches = prms => rejected => promisifyAll(prms).fail(errors => rejected(errorArgs(errors)))

  const resolveAlways = prms => resolved => {

    return promisifyAll(prms)
      .then((...args) => promisify(resolved.apply(this, args)))
      .fail(errors => resolve(resolved(errorArgs(errors))))
  }

  const always = resolved => (...prms) => resolveAlways(prms)(resolved)

  const alwaysWhen = (...prms) => resolveAlways(prms)

  const catches = rejected => (...prms) => resolveCatches(prms)(rejected)

  const unless = (...prms) => resolveCatches(prms)

  const when = (...prms) => resolveCallbacks(prms)

  const then = (resolved, rejected) => (...prms) => resolveCallbacks(prms)(resolved, rejected)

  const spreadTo = fn => (...args) => fn.apply(this, flatten(args))

  const concatTo = fn => (...args) => fn.call(this, flatten(args))

  return {
    all,
    always,
    alwaysWhen,
    catches,
    compose,
    concatTo,
    flatten,
    map,
    spreadTo,
    resolve,
    reject,
    then,
    unless,
    when
  }
}

export default ƤromƊress
