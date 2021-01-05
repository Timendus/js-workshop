#!/usr/bin/env node

async function examples() {

  /** Consuming promises async **/

  try {
    const result = await fetch('http://paaldb.timendus.com/api/locations/34aa966d-e4ca-432c-bc78-489d3eaea135');
    if ( !result.ok ) throw `Server said '${result.statusText}'`;
    const json = await result.json();
    console.log(json);
  } catch(error) {
    console.log("We have a booboo! " + error);
  }

  console.log("Aaaand we're done");

  /** Creating promises async **/

  async function promise() {
    if ( 2 == 2 )
      return 'Great succes!';
    else
      throw 'Big failure';
  }

  try {
    const msg = await promise();
    console.log("Yaay! " + msg);
  } catch(msg) {
    console.log("Boooh! " + msg)
  }

}

examples();
