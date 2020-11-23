#!/usr/bin/env node
const http = require('http');

// How Promises work: asynchronous control flow

/** The basics **/

const promise = new Promise((resolve, reject) => {
  setTimeout(() => { resolve('Hello, '); }, 1000);
  setTimeout(() => { reject('Too bad!'); }, 1200);
});

const chainedPromise = promise.then(msg => {
  console.log(`${msg}world!`);
});

chainedPromise.catch(msg => {
  console.error(`Promise rejected with message ${msg}`);
});

/** What it's good for **/

serverRequest('http://date.jsontest.com')
  .then(response => console.log(response))
  .catch(error => console.error(`Server got angry: ${error}`));

// or more imperative:

async function run() {
  try {
    const response = await serverRequest('http://date.jsontest.com');
    console.log(response);
  } catch (error) {
    console.error(`Server got angry: ${error}`);
  }
}

run();

// Promise based HTTP GET API

function serverRequest(url) {
  return new Promise((resolve, reject) => {
    const request = http.get(url, response => {
      if (response.statusCode !== 200)
        return reject(response.statusCode);

      let body = '';
      response.setEncoding('utf8');
      response.on('data', d => body += d);
      response.on('end', () => resolve(JSON.parse(body)));
    });
    request.on('error', e => reject(e.message));
  });
}
