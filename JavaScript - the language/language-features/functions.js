#!/usr/bin/env node

// Functions in JavaScript are flexible beasts

/** "Regular" functions **/

function callMe(x, y) {
  return x + y;
}

const square = function(x) {
  return x * x;
}

console.log(typeof square);
console.log(square(callMe(2, 3)));

/** Arrow functions **/

const pow = (x, y) => {
  return x ** y;
}

const div = (x, y) => x / y;

const indexifier = x => x - 1;

const table = {
  width: 100,
  length: 150,
  surface: () => table.width * table.length,
  chairs: () =>
    Math.floor(table.width / 60) * 2 +
    Math.floor(table.length / 60) * 2
}

console.log(pow(2, 8));
console.log(div(6, 2));
console.log(indexifier(5));
console.log(table.surface(), table.chairs());

/** Functions and the 'this' context **/
/* WUT ;P Nog even in duiken ;) */

const thisBinder = {
  parentThis: () => {
    return this;
  },
  myThis: function() {
    return this;
  }
}

const a = () => { return this };
const b = function() { return this; }

console.log(a());
console.log(b());

console.log(thisBinder.parentThis())
console.log(thisBinder.myThis());

/** Higher order functions **/

function gimmeFunc(x) {
  return y => x + y;
}

const func1 = gimmeFunc(5);
const func2 = gimmeFunc(10);

console.log(func1(3), func2(3));

function sort(input, compare) {
  const output = [];
  for ( let i = 0; i < input.length; i++ ) {
    let j = 0;
    while ( j < output.length && !compare(input[i], output[j]) ) {
      j++;
    }
    output.splice(j, 0, input[i]); // Insert value at index j, delete 0 entries
  }
  return output;
}

const sorted  = sort([5, 2, 6, 1, 2, 25], (a, b) => a < b);
const reverse = sort([5, 2, 6, 1, 2, 25], (a, b) => a > b);

console.log(sorted);
console.log(reverse);
