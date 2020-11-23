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
