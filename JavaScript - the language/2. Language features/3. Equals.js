#!/usr/bin/env node

// Double equals tries to type-cast for you

console.log(0 == []);   // true
console.log(0 == '0');  // true
console.log([] == '0'); // false

// Tripple equals checks for 'object equality'

console.log(0 === []);   // false
console.log(0 === '0');  // false
console.log([] === '0'); // false

// Which is more useful / better?

console.log('Hello world' == new String('Hello world'));              // true
console.log('Hello world' === new String('Hello world'));             // false
console.log(new String('Hello world') === new String('Hello world')); // false
console.log('Hello world' === "Hello world");                         // true
console.log('Hello world' === `Hello world`);                         // true
console.log(BigInt(5) === BigInt(5));                                 // true

// Actually, numeric operators try to do the same thing as ==

console.log(5 + 5);    // 10
console.log(5 + '5');  // '55'
console.log('5' + 5);  // '55'
console.log(5 + +'5'); // 10
console.log(5 + [5]);  // '55'
console.log([5] + 5);  // '55'
console.log(5 + +[5]); // 10

// See also https://www.destroyallsoftware.com/talks/wat for your amuzement
// And https://developer.mozilla.org/en-US/docs/Web/JavaScript/Equality_comparisons_and_sameness for more info
