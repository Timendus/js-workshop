#!/usr/bin/env node

// Difference between 'let' and 'const'

/** Simple types **/

  let number1 = 10;
const number2 = 10;

  let string1 = 'hello';
const string2 = 'hello';

  let bool1 = true;
const bool2 = true;

number1 = 20;
number2 = 20; // <-- TypeError: Assignment to constant variable.

string1 = 'bye';
string2 = 'bye'; // <-- TypeError: Assignment to constant variable.

bool1 = false;
bool2 = false; // <-- TypeError: Assignment to constant variable.

/** Arrays **/

  let array1 = [ 1, 2, 3 ];
const array2 = [ 1, 2, 3 ];

array1 = [ 4, 5, 6 ];
array2 = [ 4, 5, 6 ]; // <-- TypeError: Assignment to constant variable.

array1.push(10);
array2.push(10); // This is fine though

array1[1] = 'a';
array2[1] = 'a'; // This is fine though

console.log(array1, array2);

/** Objects **/

  let object1 = { props: 5 };
const object2 = { props: 5 };

object1 = { props: 4 };
object2 = { props: 4 }; // <-- TypeError: Assignment to constant variable.

object1.props = 10;
object2.props = 10; // This is fine though

console.log(object1, object2);

/** Object.freeze **/

const object3 = Object.freeze({ props: 5 });

object3 = { props: 4 }; // <-- TypeError: Assignment to constant variable.
object3.props = 10;     // <-- This is a no-op

console.log(object3);
