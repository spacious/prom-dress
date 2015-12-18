
import test from "ava"

const Parse = require("parse/node")

import { future, then, when, always, compose, resolve, reject, catches } from "../"

/* helpers */

function getAsyncPromise(result, options = { resolves: true }){
  const p = new Parse.Promise()
  setTimeout(() => { return options.resolves ? p.resolve(result) : p.reject(result) }, 100)
  return p
}
const asyncSuccess = (result) => { return getAsyncPromise(result, { resolves: true }) }
const asyncFailure = (result) => { return getAsyncPromise(result, { resolves: false }) }

/* aliases */

test("aliases are provided to match promise implementations", t => {

  t.plan(2)

  const success = resolve(true)

  when(success)((bool) => { t.is(true, bool, "resolve resolves") })

  const failure = reject(false)

  const error = (bool) => { t.is(false, bool, "reject rejects") }

  catches(error)(failure)

})

/* future, then, when */

test("methods return themselves or the promises if called empty", t => {

  t.plan(6)

  let fut = future()
  t.is(fut, future, "future returns itself")

  let alw = always()
  t.is(alw, always, "always returns itself")

  let cat = catches()
  t.is(cat, catches, "catches returns itself")

  fut = fut((res) => { t.is(res, "future", "expected arguments received") })
  let f = fut()
  t.is(f, fut, "future returns promise callback")

  alw = alw((res) => { t.is(res, "always", "expected arguments received") })
  let a = alw()
  t.is(a, alw, "always returns promise callback")

  cat = cat((res) => { t.is(res, "catches", "expected arguments received") })
  let c = cat()
  t.is(c, cat, "catches returns promise callback")

  const result = asyncSuccess(2)
  const fail = asyncFailure(-2)

  fut = future(result)
  f = fut()
  f.then((res) => { t.is(res, 2, "future returns promise") })

  alw = always(result)
  a = alw()
  a.then((res) => { t.is(res, 2, "always returns promise") })

  cat = catches(fail)
  c = cat()
  c.then((res) => { t.is(res,[-2], "catches returns promise (note the array") })

})


test("future wraps function to receive promise arguments", t => {

  t.plan(1)

  const callback = future((res) => { t.is(res, "future", "expected arguments received") })

  callback(asyncSuccess("future"))
})

test("future wraps promises to send as function arguments", t => {

  t.plan(1)

  const callback = (res) => { t.is(res, "future", "expected arguments received") }

  future(asyncSuccess("future"))(callback)
})

test("future wraps rejects to send to failure callbacks", t => {

  t.plan(1)

  const callback = () => {

    t.fail("success should not be called")
  }

  const error = (str) => {

    t.is(str, "future-error", "failure callback called")
  }

  const result = asyncFailure("future-error")

  future(callback, error)(result)
})

test("future is aliased as then and when for chaining readability", t => {

  t.plan(3)

  const first = (res) => {
    t.is(res, 2, "called with initial value")
    return res + res
  }

  const second = (res) => {
    t.is(res, 4, "called with result of previous method")
    return res
  }

  const result = asyncSuccess(2)

  const doubled = when(result)(first)

  const finished = then(second)(doubled)

  finished.then((res) => { t.is(res, 4, "received final value") })
})

/* always */

test("always guarantees success callbacks always get called", t => {

  t.plan(4)

  const callback = (str) => {

    t.is(str, "future-is-dead")

    return "future-is-whatever"
  }

  const rejected = asyncFailure("future-is-dead")

  const checked = always(callback)(rejected)

  const reset = when(checked)((str) => { t.is(str, "future-is-whatever") })

  const result = when(reset)(() => { return asyncSuccess("future-is-dead") })

  const rechecked = always(result)(callback)

  when(rechecked)((str) => { t.is(str, "future-is-whatever") })
})

test("always allows failure callbacks to still get called", t => {

  t.plan(5)

  const callback = (str) => {

    t.is(str, "future-is-dead", "success callback called")

    return "future-is-whatever"
  }

  const error = (str) => {

    t.is(str, "future-is-dead", "failure callback called")
  }

  const rejected = asyncFailure("future-is-dead")

  const checked = always(rejected)(callback, error)

  const reset = when(checked)((str) => { t.is(str, "future-is-whatever") })

  const result = when(reset)(() => { return asyncSuccess("future-is-dead") })

  const rechecked = always(callback)(result)

  when(rechecked)((str) => { t.is(str, "future-is-whatever") })
})

/* compose */

test("compose allows functions to be composed over promises", t => {

  t.plan(3)

  const first = (res) => {
    t.is(res, 2, "called with initial value")
    return res + res
  }

  const second = (res) => {
    t.is(res, 4, "called with result of previous method")
    return res
  }

  const compute = compose(second, first)

  const result = asyncSuccess(2)

  const finished = when(result)(compute)

  finished.then((res) => { t.is(res, 4, "received final value") })
})
