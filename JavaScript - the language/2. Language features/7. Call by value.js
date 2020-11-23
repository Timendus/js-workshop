#!/usr/bin/env node

// Call by value or call by reference?

let number = 10;
let string = "hello";
let array = [ 1, 2, 3 ];
let object = {
  property: 'value'
};

func(number, string, array, object);

console.log(number);
console.log(string);
console.log(array);
console.log(object);

function func(number, string, array, object) {
  number = 20;
  string = "world";

  array.push(4);
  array[1] = 'beep';
  array = [ 'a', 'b' ];

  object.property = 'new value';
  object.prop2 = 'things';
  object = {
    something: 'completely different'
  };
}
