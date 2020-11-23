#!/usr/bin/env node

// TODO: chainable function

class Animal {

  constructor() {
    this.movement = 'moving';
    this.numLegs = 4
  }

  move() {
    console.log(`I'm ${this.movement} with my ${this.numLegs} legs`);
  }

}

class Snake extends Animal {

  constructor() {
    super();
    this.movement = 'slithering';
    this.numLegs = 0;
  }

}

class Horse extends Animal {

  constructor() {
    super();
    this.movement = 'galloping';
  }

}

const animal = new Animal();
const snake = new Snake();
const horse = new Horse();

animal.move();
snake.move();
horse.move();

// There's no such thing as a private property

console.log(animal.numLegs);
console.log(horse);

snake.numLegs = 8;
snake.move();
