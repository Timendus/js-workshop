#!/usr/bin/env node
const Horse = require('./commonjs-modules/horse');
const Snake = require('./commonjs-modules/snake');

new Horse().move();
new Snake().move();
