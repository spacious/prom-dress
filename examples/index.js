/** =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
 = ƤƊ - parse promise helper library examples =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
 =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

"use strict"

const Parse = require("parse/node")
const Promise =  Parse.Promise

const ƤƊ = require("../parse")
const always = ƤƊ.always
const alwaysWhen = ƤƊ.alwaysWhen
const catches = ƤƊ.catches
const then = ƤƊ.then
const when = ƤƊ.when
const concatTo = ƤƊ.concatTo
const spreadTo = ƤƊ.spreadTo
const map = ƤƊ.map
const compose = ƤƊ.compose
const flatten = ƤƊ.flatten
const resolve = ƤƊ.resolve
const reject = ƤƊ.reject
const unless  = ƤƊ.unless

const log = console.log.bind(console)
let result = [asyncSuccess([1,2,4]), asyncSuccess([3,2,1])]
then(log)(result)
const inc = val => val + 2
let flat = when(result)(flatten)
let added = when(flat)(map(inc))
then(log)(added)

when(resolve("."))(log)
unless(reject("."))(log)

let adding = when(result)(map(map(inc)))
then(log)(adding)

let flats = when(result)(compose(map(inc), flatten))
when(flats)(log)

when(resolve([1,2,3]))(spreadTo(log))

when(1,2,3)(concatTo(log))

catches(log)(reject("XXXX"))

// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

let results = getAsyncResults("data")
let processed = then(processSync)(results)
let queried = then(queryAsync)(processed)
let formatted = then(formatSync)(queried)

when(formatted)(log)

// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

const process = then(processSync)
const query = then(queryAsync)
const format = then(formatSync)

// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

processed = process(results)

queried = query(processed)

formatted = format(queried)

when(formatted)(log)

// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

results = getAsyncResults("queryAsyncError")

processed = process(results)

queried = when(processed)(queryAsyncError)

formatted = format(queried)

then(log)(formatted)

unless(formatted)(log)

// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

results = getAsyncResults("..")

processed = process(results)

queried = then(queryAsyncError)(processed)

formatted = always(formatSyncGuaranteed)(queried)

when(formatted)(log, log)

// with no errors:

results = getAsyncResults("queryAsync")

processed = process(results)

queried = query(processed)

formatted = alwaysWhen(queried)(formatSyncGuaranteed)

when(formatted)(log, log)

// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-==-=-=-=-=-=-=-=-=-=-

function getAsyncPromise(result, options){
  const p = new Parse.Promise()
  setTimeout(() => {
    return options.resolves ? p.resolve(result) : p.reject(result) }, 100)
  return p
}
function asyncSuccess(result){
  return getAsyncPromise(result, { resolves: true })
}


function getAsyncResults(str){
  const p = new Promise()
  setTimeout(function(){
    p.resolve({ "results": [str] })
  },500)
  return p
}

function processSync(result){
  result.count = result.results.length
  return result
}

function queryAsync(result){
  const p = new Promise()
  setTimeout(function(){
    return p.resolve({ "results": [ result ] })
  },500)
  return p
}

function formatSync(result){
  return result.results[0].results[0].toUpperCase()
}

function formatSyncGuaranteed(result){
  if(!result || !result.results){
    return {
      results: [ "ABC" ]
    }
  }

  return formatSync(result)
}

function queryAsyncError(){
  const p = new Promise()
  setTimeout(function(){ return p.reject(["ERROR"]) },500)
  return p
}