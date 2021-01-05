import Animal from './animal.mjs';

export default class Horse extends Animal {

  constructor() {
    super();
    this.movement = 'galloping';
  }

}
