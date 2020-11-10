/** Make this code work with GCC: **/
#include <stdio.h>
#define let int
#define function int

/** Make this code work with node: **/
// const util = require('util');
// const printf = (...p) => process.stdout.write(util.format(...p));
// main();


/** Real program start **/

function greet() {
  printf("Hello, world!\n");
  return 0;
}

// Kernighan & Ritchie -- Chapter 1.8: Arguments - Call by Value
function power(base, n) {
  let p;
  for (p = 1; n > 0; --n)
    p = p * base;
  return p;
}

function main() {
  greet();
  printf("2^8 = %i", power(2, 8));
}
