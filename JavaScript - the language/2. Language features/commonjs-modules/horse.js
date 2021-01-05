const Animal = require('./animal');

class Horse extends Animal {

  constructor() {
    super();
    this.movement = 'galloping';
  }

}

module.exports = Horse;
