/** =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
 = ƤromƊress - parse promise helper library examples =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
 =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

var Parse = require("parse/node")
var Promise =  Parse.Promise;

var ƤromƊress = require("../parse");
var future = ƤromƊress.future;
var always = ƤromƊress.always;
var compose = ƤromƊress.compose;
var then = ƤromƊress.then;
var when = ƤromƊress.when;
var º = when;


// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

// normal promise workflow:

getAsyncResults("using a normal promise chain")
  .then(processSync)
  .then(queryAsync)
  .then(formatSync)
  .then(log);

// using prms:

var results = getAsyncResults("using then/when");

var processed = then(processSync)(results);

var queried = then(queryAsync)(processed);

var formatted = then(formatSync)(queried);

when(formatted)(log);

// pre-wrap functions to accept promise arguments

var process = future(processSync);
var query = future(queryAsync);
var format = future(formatSync);

// and then:

results = getAsyncResults("using future pre-wrapped");

processed = process(results);

queried = query(processed);

formatted = format(queried);

when(formatted)(log);

// one liners:

º(º(º(º(getAsyncResults("whoa"))(processSync))(queryAsync))(formatSync))(log);

// composition:

var to_format = compose(formatSync, queryAsync, processSync);

var loaded = when(getAsyncResults("using compose"));

var formed = loaded(to_format);

when(formed)(log);

// or

var others = getAsyncResults("also using compose");

var also_formed = when(others)(to_format);

when(also_formed)(log);

// `then` and `when` are interchangeable (they both just alias `future`)

then(processSync)(results) || when(processSync)(results);

// they just make slightly more readable since order is also interchangeable:

then(processSync)(results) || when(results)(processSync);

// Errors =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

results = getAsyncResults("say hi to queryAsyncError");

processed = process(results);

queried = when(processed)(queryAsyncError);

formatted = format(queried);

then(log, errLog)(formatted);

// Guarantees (always) =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

results = getAsyncResults("ok, query. meet our new format. it's...");

processed = process(results);

queried = then(queryAsyncError)(processed);

formatted = always(formatSyncGuaranteed, wrnLog)(queried);

when(formatted)(log, errLog);

// with no errors:

results = getAsyncResults("welcome back, queryAsync");

processed = process(results);

queried = query(processed);

formatted = always(queried)(formatSyncGuaranteed, wrnLog);

when(formatted)(log, errLog);

// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-==-=-=-=-=-=-=-=-=-=-

// Helpers

function getAsyncResults(str){

  var p = new Promise();

  setTimeout(function(){

    p.resolve({ "results": [str] });

  },2000);

  return p;
}

function processSync(result){

  result.count = result.results.length;

  return result;
}

function queryAsync(result){

  var p = new Promise();

  setTimeout(function(){
    return p.resolve({ "results": [result], "count": 2 });
  },2000);

  return p;
}

function formatSync(result){

  return result.results.concat(result.count);
}

function log(str){

  console.log("[INFO] %j", str);
  console.log();
}

function formatSyncGuaranteed(result){

  if(!result || !result.results){

    return [{ results: [ 'guaranteed' ], count: 1 }, 2];
  }

  result.results.push("(I am still guaranteed)");

  return formatSync(result);
}

function wrnLog(str){

  console.error("[WARN] There was an error (" + str + ") but it's ok.");
  console.error();
}

function queryAsyncError(){

  var p = new Promise();

  setTimeout(function(){ return p.reject("oh no! queries don't work!"); },2000);

  return p;
}

function errLog(str){

  console.error("[ERR] " + str + " : Everything past error was skipped! But we logged it.");
  console.error();
}
