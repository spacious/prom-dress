
import test from "ava"

const Parse = require("parse/node")

import {
  always,
  alwaysWhen,
  catches,
  then,
  when,
  concatTo,
  spreadTo,
  map,
  compose,
  flatten,
  resolve,
  reject,
  unless } from "../parse"

/* helpers */

function getAsyncPromise(result, options = { resolves: true }){
  const p = new Parse.Promise()
  setTimeout(() => { return options.resolves ? p.resolve(result) : p.reject(result) }, 100)
  return p
}
const asyncSuccess = (result) => { return getAsyncPromise(result, { resolves: true }) }
const asyncFailure = (result) => { return getAsyncPromise(result, { resolves: false }) }

const syncToString = (res) => { return res.toString() }

const asyncToObjectAsValue = (value) => { return asyncSuccess({ value })}

/* then/when */

test("`then` wraps function to receive promise arguments", t => {

  t.plan(1)

  const callback = then((res) => { t.is(res, "future", "expected arguments received") })

  callback(asyncSuccess("future"))
})

test("`when` wraps promises to send as function arguments", t => {

  t.plan(1)

  const callback = (res) => { t.is(res, "future", "expected arguments received") }

  when(asyncSuccess("future"))(callback)
})

test("`then` wraps rejects to send to failure callbacks", t => {

  t.plan(2)

  const callback = () => {

    t.fail("success should not be called")
  }

  const error = (errors) => {

    t.is(errors.length, 1, "failure callback called")
    t.is(errors[0], "future-error", "failure callback called")
  }

  const result = asyncFailure("future-error")

  then(callback, error)(result)
})

test("default error handler is provided", t => {

  t.plan(2)

  const callback = () => {

    t.fail("success should not be called")
  }

  const result = asyncFailure("future-error")
  const fail = then(callback)(result)

  unless(fail)((errors) => {

    t.is(errors.length, 1, "returned object with value")
    t.is(errors[0],"future-error")
  })
})

/* arguments and arity */

test("when accepts values, promises, arrays of values and promises", t => {

  t.plan(13)

  const loaders = [asyncSuccess(1),asyncSuccess(2),asyncSuccess(3),asyncSuccess(4)]

  when(loaders)((result) => {

    t.is(result.length, loaders.length, "returned array")
    t.is(result[0], 1, "returned array promise value")
    t.is(result[1], 2, "returned array promise value")
    t.is(result[2], 3, "returned array promise value")
    t.is(result[3], 4, "returned array promise value")
  })

  when(asyncSuccess(1),asyncSuccess(2))((a, b) => {

    t.is(a, 1, "returned argument value")
    t.is(b, 2, "returned argument value")
  })

  when([16, asyncSuccess(9)])((result) => {

    t.is(result.length, 2, "returned array")
    t.is(result[0], 16, "returned value")
    t.is(result[1], 9, "returned promise value")
  })

  when(asyncSuccess(11), 12, 13)((a, b, c) => {

    t.is(a, 11, "returned argument value")
    t.is(b, 12, "returned argument value")
    t.is(c, 13, "returned argument value")
  })
})

test("arity is preserved by default", t => {

  t.plan(5)

  const numberTwo = asyncSuccess(2)
  const numberFour = asyncSuccess(4)

  when(numberTwo, numberFour)((a, b) => {
    t.is(a, 2, "arity is preserved")
    t.is(b, 4, "arity is preserved")
  })

  const sendLetters = then((a,b,c) => {
    t.is(a, "y", "arity is preserved")
    t.is(b, "x", "arity is preserved")
    t.is(c, "z", "arity is preserved")
  })

  sendLetters(asyncSuccess("y"), asyncSuccess("x"), asyncSuccess("z"))

})

/* arity helpers */

test("helpers to spread and concat arguments", t => {

  t.plan(6)

  const numberTwo = asyncSuccess(16)
  const numberFour = asyncSuccess(9)

  const numberArray = result => {

    t.is(result.length, 2, "returned array")
    t.is(result[0], 16, "returned argument as array value")
    t.is(result[1], 9, "returned argument as array value")
  }

  when(numberTwo, numberFour)(concatTo(numberArray))

  const spreadLetters = then(spreadTo((a,b,c) => {
    t.is(a, "y", "arity is preserved")
    t.is(b, "x", "arity is preserved")
    t.is(c, "z", "arity is preserved")
  }))

  spreadLetters([asyncSuccess("y"), asyncSuccess("x"), asyncSuccess("z")])

})

/* aliases */

test("aliases are provided to match promise implementations", t => {

  t.plan(3)

  const success = resolve(true)

  when(success)((bool) => { t.is(true, bool, "resolve resolves") })

  const failure = reject(false)

  when(failure)(()=>{}, (errors) => {
    t.is(errors.length, 1, "failure callback called")
    t.is(errors[0], false, "failure callback called")
  })
})

/* map */

test("standard map functions can be used", t => {

  t.plan(9)

  const inc2 = val => { return val + 2 }
  const err = val => { return "Error was " + val }

  const incremented = when([asyncSuccess(1), asyncSuccess(2)])(map(inc2))

  when(incremented)((result) => {

    t.is(result.length, 2, "returned array")
    t.is(result[0], 3, "returned incremented value")
    t.is(result[1], 4, "returned incremented value")

  })

  const failure = reject("huge")

  when(failure)(()=> {
  }, map(err)).fail((result) => {

    t.is(result.length, 1, "returned array")
    t.is(result[0], "Error was huge", "returned mapped value")
  })

  const strings = then(map(syncToString))([1, 2, asyncSuccess(3)])

  when(strings)((result) => {

    t.is(result.length, 3, "returned array")
    t.is(result[0], "1", "returned mapped value")
    t.is(result[1], "2", "returned mapped value")
    t.is(result[2], "3", "returned mapped value")
  })
})

/* compose/flatten */

test("compose and flatten helpers", t => {

  t.plan(21)

  const checkFlats = (result) => {

    t.is(result.length, 6, "returned array")
    t.is(result[0], 3, "returned mapped value")
    t.is(result[1], 4, "returned mapped value")
    t.is(result[2], 6, "returned mapped value")
    t.is(result[3], 5, "returned mapped value")
    t.is(result[4], 4, "returned mapped value")
    t.is(result[5], 3, "returned mapped value")
  }

  const inc2 = val => { return val + 2 }

  let results = [asyncSuccess([1,2,4]), asyncSuccess([3,2,1])]

  let flat = when(results)(flatten)

  when(flat)(map(inc2)).then(checkFlats)

  let flatAdd = compose(map(inc2), flatten)
  when(results)(flatAdd).then(checkFlats)


  let liftAdd = map(map(inc2))
  when(results)(liftAdd).then((result) => {

    t.is(result.length, 2, "returned array not flattened")
    t.is(result[0].length, 3, "returned array not flattened")
    t.is(result[1].length, 3, "returned array not flattened")
    t.is(result[0][2], 6, "returned mapped value")
    t.is(result[1][0], 5, "returned mapped value")
    t.is(result[1][1], 4, "returned mapped value")
    t.is(result[1][2], 3, "returned mapped value")
  })
})

test("map on async functions", t => {

  t.plan(4)

  const checkAsync = (result) => {

    t.is(result.length, 3, "returned object with value")
    t.is(result[0].value, 1, "returned mapped value")
    t.is(result[1].value, 2, "returned mapped value")
    t.is(result[2].value, 4, "returned mapped value")
  }

  let results = asyncSuccess([1,2,4])

  let obj = when(results)(map(asyncToObjectAsValue))

  when(obj)(checkAsync)
})

/* always */

test("always guarantees success callbacks always get called", t => {

  t.plan(4)

  const callback = (val) => {

    t.is(val, "future-is-dead", "errors are arrays but spreadTo flattens them")

    return "future-is-whatever"
  }

  const rejected = asyncFailure("future-is-dead")

  const checked = always(spreadTo(callback))(rejected)

  const reset = when(checked)((str) => { t.is(str, "future-is-whatever") })

  const result = when(reset)(() => { return asyncSuccess("future-is-dead") })

  const rechecked = alwaysWhen(result)(callback)

  when(rechecked)((str) => { t.is(str, "future-is-whatever") })
})

/* catches */

test("catches registers an error handler", t => {

  t.plan(3)

  const callback = (val) => {

    t.is(val, "future-is-dead", "errors are arrays but spreadTo flattens them")

    return "future-is-whatever"
  }

  const rejected = asyncFailure("future-is-dead")

  const checked = catches(spreadTo(callback))(rejected)

  unless(checked)(errors => {

    t.is(errors.length, 1, "returned object with value")
    t.is(errors[0], "future-is-whatever")
  })
})

