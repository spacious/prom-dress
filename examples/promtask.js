


"use strict"

const Parse = require("parse/node")
const Pr = Parse.Promise
const Task = require("./lib/promtask")


/* helpers */


function getAsyncPromise(result, options){
  const p = new Parse.Promise()
  setTimeout(() => { return options.resolves ? p.resolve(result) : p.reject(result) }, options.time || 1000)
  return p
}
const asyncSuccess = result => getAsyncPromise(result, { resolves: true, time: 1000 })
const asyncFailure = result => getAsyncPromise(result, { resolves: false, time: 500 })

const onError = err => console.log("ERRO", err)
const onData = data => console.log("data", data)

const addFail = t => (t + " failure..").toLowerCase()
const addPass = t => (t + " success!").toUpperCase()


const upper = t => t.toUpperCase()
const lower = t => t.toLowerCase()
const negater = t => t.replace(/not/ig,"").trim()
const stripper = t => t.replace(/,/g,"")

const a = Task.of(asyncSuccess("a testing map"))
a.map(upper).fork(onError, onData)

const b = Task.of(asyncSuccess("b testing ap"))
const c = Task.of(upper)

c.ap(b).fork(onError, onData)

const d = Task.of(asyncSuccess("d testing chain"))
const e = (str) => Task.of(upper(str))

d.chain(e).fork(onError, onData)

const f = Task.of(asyncSuccess("f not testing map, chain, ap"))
const g = (str) => Task.of(negater(str))
const h = Task.of(upper)

h.ap(f).map(stripper).chain(g).fork(onError, onData)

const i = Task.of(getAsyncPromise("i testing concat", { resolves: true, time: 1500 }))
const j = Task.of(getAsyncPromise("j testing concat (faster)", { resolves: true, time: 1200 }))

i.concat(j).map(upper).fork(onError, onData)

const k = Task.rejected(asyncFailure("k testing failure"))

k.fork(onError, onData)

const l = Task.rejected(asyncFailure("l testing orElse"))
const m = (str) => Task.of(upper(str))

l.orElse(m).fork(onError, onData)

const n = Task.rejected(asyncFailure("n testing map/rejectedMap error"))

n.map(addPass).rejectedMap(addFail).fork(onError, onData)

const o = Task.of(asyncSuccess("o testing map/rejectedMap data"))

o.map(addPass).rejectedMap(addFail).fork(onError, onData)

const p = Task.fromPromise(asyncSuccess("p testing success Promise"))

p.fork(onError, onData)

const q = Task.fromPromise(asyncFailure("q testing failure Promise"))

q.fork(onError, onData)

const r = Task.fromPromise(asyncFailure("r testing promise bimap error"))

r.bimap(addFail, addPass).fork(onError, onData)

const s = Task.fromPromise(asyncSuccess("s testing promise bimap data"))

s.bimap(addFail, addPass).fork(onError, onData)

const t = Task.rejected(asyncFailure("t testing swap error"))

t.swap().map(addPass).rejectedMap(addFail).fork(onError, onData)

const u = Task.of(asyncSuccess("u testing swap data"))

u.swap().map(addPass).rejectedMap(addFail).fork(onError, onData)

const v = Task.fromPromise(asyncFailure("v testing promise fold error"))

v.fold(addPass, addPass).fork(onError, onData)

const w = Task.fromPromise(asyncSuccess("w testing promise fold data"))

w.fold(addPass, addPass).fork(onError, onData)

const x = { "Rejected": negater, "Resolved": addPass }

const y = Task.fromPromise(asyncFailure("y testing promise cata x not data"))

y.cata(x).fork(onError, onData)

const z = Task.fromPromise(asyncSuccess("z testing promise cata x data"))

z.cata(x).fork(onError, onData)
