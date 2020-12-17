#!/usr/bin/env node

// Control flow is pretty much C-style, with a few exceptions

/** If / else **/

if ( true ) console.log("It's true");

if ( false ) {
  // Do a block of statements
} else {
  // You know this drill...
}

/** Ternary operator **/

const value = 5;
const consequence = value > 3 ? 'A big value' : 'Not so big value';

/** Loops **/

let i = 5;
while ( i ) {
  console.log(i);
  i--;
}

for ( let i = 5; i > 0; i-- ) {
  console.log(i);
}

const array = [1, 2, 3, 4, 5, 6];

// "creates a loop iterating over iterable objects, including: built-in String,
// Array, array-like objects (e.g., arguments or NodeList), TypedArray, Map,
// Set, and user-defined iterables."
for ( const i of array ) {
  console.log(i);
}

// "iterates over all enumerable properties of an object that are keyed by
// strings (ignoring ones keyed by Symbols), including inherited enumerable
// properties"
for ( const i in array ) {
  console.log(array[i]);
}

/** Switch / case **/

switch ( value ) {
  case '1':
    console.log('The value was very low');
    break;
  case '2':
    console.log('The value was twice as high as one');
    break;
  default:
    console.log('The value was substantial');
    break;
}

/** Try / catch / throw **/

const error = false;

try {
  if ( error )
    throw 'OOH NOOOZ';

  console.log('Expected outcome');
} catch (e) {
  console.log('We got an error Jim! ' + e);
} finally {
  console.log('Done with this example!');
}
