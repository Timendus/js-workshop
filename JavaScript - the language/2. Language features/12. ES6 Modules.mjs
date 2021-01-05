#!/usr/bin/env node --experimental-modules
import Horse from './es6-modules/horse.mjs';
import Snake from './es6-modules/snake.mjs';

new Horse().move();
new Snake().move();
