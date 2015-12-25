"use strict"

const Task = require("data.task")

/* Parse */
const Parse = require("parse/node")
const Pr = Parse.Promise
const all = (...args) => Pr.when.apply(Pr.when, args)
const doResolve = (val) => Pr.as(val)
const doReject = (err) => Pr.error(err)

function map(fn, items){
  if (!items){ return (i) => map(fn, i) }
  const len = items.length
  const result = new Array(len)
  let i = -1
  while (++i < len){ result[i] = fn(items[i]) }
  return result
}
/* Utility */
const isArray = Array.isArray
const slice = Array.prototype.slice
const isPromise = val => (val instanceof Parse.Promise)
const applyArray = (...args) => slice.call(args)
const promisify = val => isArray(val) ? all(val).then(applyArray) : !isPromise(val) ? doResolve(val) : val
const promisifyAll = items => items ? (isArray(items) ? all(map(promisify, items)) : promisify(items)) : items

module.exports = {

  fromPromise(p) { return new Task((reject, resolve) => p.then(resolve).fail(reject)) },

  of(b) { return new Task((_, resolve) => promisifyAll(b).then(resolve)) },

  rejected(a) { return new Task(reject => promisifyAll(a).then(doReject).fail(reject) ) }
}
