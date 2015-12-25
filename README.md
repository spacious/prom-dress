<h1 align="center"> Ƥrom<img src="./SEEME.jpg" width="38" height="50">Ɗress </h1>

<p align="center"><em>small promise dresser built for a parse project... maybe for <a href="https://promisesaplus.com">Promises/A+</a> in the future</em></p>

<p align="center"><em>inspired one late night by <a href="https://medium.com/@isntitvacant/observations-on-promises-2b08a0d0c27#.9fd2vkmsi">Observations on Promises</a></em></p>

<p align="center"><em>super small and simply provides a little <code>then</code> to pass functions promises and a little <code>when</code> to pass promises functions</em></p>

```javascript

    let result = [asyncSuccess([1,2,4]), asyncSuccess([3,2,1])]
    
    then(log)(result)            // [ [ 1, 2, 4 ], [ 3, 2, 1 ] ]

    const inc = val => val + 2
    let flat = when(result)(flatten)
    let added = when(flat)(map(inc))
    
    then(log)(added)             // [ 3, 4, 6, 5, 4, 3 ]
    when(resolve("."))(log)      // .

    unless(reject("."))(log)     //[ '.' ]

    let adding = when(result)(map(map(inc)))
    
    then(log)(adding)            // [ [ 3, 4, 6 ], [ 5, 4, 3 ] ]

    let flats = when(result)(compose(map(inc), flatten))
    
    when(flats)(log)            //  [ 3, 4, 6, 5, 4, 3 ]

    when(resolve([1,2,3]))(spreadTo(log))   // 1 2 3

    when(1,2,3)(concatTo(log))              // [ 1, 2, 3 ]

    catches(log)(reject("ERROR"))           // [ 'ERROR' ]

```