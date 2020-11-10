#!/usr/bin/env node

const array = [ 1, 2, 3, 4, 5 ];

// Use function for array manipulation

console.log(array);
console.log(array.filter(v => v > 2));
console.log(array);

const newArray = array.filter(v => v > 2)
                      .map(v => v * 2)
                      .sort((a, b) => a < b ? 1 : -1);

console.log(newArray);

// Be careful, sort actually changes the array

array.sort((a, b) => a < b ? 1 : -1);
console.log(array);

// Use function for iteration

array.forEach(v => {
  console.log(v);
});

// Use function for finding a value

console.log(array.find(v => v > 2));

// Use function for checking values in an array
// Ruby's "any?" is "some" in JS
// Ruby's "all?" is "every" in JS

console.log(array.some(v => v == 5));
console.log(array.some(v => v == 6));
console.log(array.every(v => v < 6));
console.log(array.every(v => v < 4));
