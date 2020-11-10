#!/usr/bin/env node

// Difference between 'var' and 'let'

/** Re-declaration **/

var apples = 1;
var apples = 2;
let oranges = 1;
let oranges = 2; // <-- SyntaxError: Identifier 'oranges' has already been declared

/** Hoisting **/

things = 'wut';
console.log(things);
var things = 'hello';
console.log(things);

stuff = 'bad';  // <-- ReferenceError: Cannot access 'stuff' before initialization
let stuff = 'hello';

/** Block scope **/

/*if (true)*/ {
  var first = 1;
  let second = 2;
}
console.log(first, second); // <-- ReferenceError: second is not defined
