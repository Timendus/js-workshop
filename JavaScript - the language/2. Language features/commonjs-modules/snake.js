const Animal = require('./animal');

module.exports = class Snake extends Animal {

  constructor() {
    super();
    this.movement = 'slithering';
    this.numLegs = 0;
  }

}
