<h1 align="center"> Ƥrom<img src="./SEEME.jpg" width="38" height="50">Ɗress </h1>

<p align="center"><em>small promise dresser built for a parse project... maybe for <a href="https://promisesaplus.com">Promises/A+</a> in the future</em></p>

<p align="center"><em>inspired one late night by <a href="https://medium.com/@isntitvacant/observations-on-promises-2b08a0d0c27#.9fd2vkmsi">Observations on Promises</a></em></p>

<p align="center"><em>super small and simply provides a little <code>then</code> to pass functions promises and a little <code>when</code> to pass promises functions</em></p>

```javascript

const dater = getAsyncResults("using a normal promise chain")
  .then(processSync)
  .then(queryAsync)
  .then(formatSync)

```

<p align="center"><em>into this...</em></p>

```javascript

import { then, when, unless, map, compose, flatten , spreadTo } from "../promdress"

const queryAsync = (key, data) => { ... }
const format = then(compose(render, parse, load))

const results = getAsyncResults("...")
const process = when(results)(map(processSync))
const data = then(queryAsync)(key, process)
const output = format(data, err => go(err))

always(spreadTo(interweb))(ouput)
unless(output)(errors => debug("there was an error"))


```