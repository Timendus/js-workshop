export default class Animal {

  constructor() {
    this.movement = 'moving';
    this.numLegs = 4
  }

  move() {
    console.log(`I'm ${this.movement} with my ${this.numLegs} legs`);
  }

}
