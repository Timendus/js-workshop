import Animal from './animal.mjs';

export default class Snake extends Animal {

  constructor() {
    super();
    this.movement = 'slithering';
    this.numLegs = 0;
  }

}
