#!/usr/bin/env node

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
