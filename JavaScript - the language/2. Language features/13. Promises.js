#!/usr/bin/env node

/** Consuming promises **/

fetch('http://paaldb.timendus.com/api/locations/34aa966d-e4ca-432c-bc78-489d3eaea135')
  .then(result => {
    if ( result.ok )
      return result.json();
    else
      throw `Server said '${result.statusText}'`;
  })
  .then(json => console.log(json))
  .catch(error => console.log("We have a booboo! " + error))
  .finally(() => console.log("Aaaand we're done"))

/** Creating promises **/

console.log(new Promise(() => {}));

const promise = new Promise((resolve, reject) => {
  if ( 2 == 2 )
    resolve('Great succes!');
  else
    reject('Big failure');
});

promise
  .then(msg => console.log("Yaay! " + msg))
  .catch(msg => console.log("Boooh! " + msg));
