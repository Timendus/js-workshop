// This works as expected, because `window` fires a `load` event when the page
// is fully done loading (including styles, images...)
window.addEventListener('load', () => {
  document.body.innerHTML += '<p>Hello from <code>window.load</code> event listener</p>';
});

// This works as expected, because `document` fire a `DOMContentLoaded` event
// when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  document.body.innerHTML += '<p>Hello from <code>document.DOMContentLoaded</code> event listener</p>';
});

// This gives an error, because the DOM hasn't finished loading yet:
document.body.innerHTML += '<p>Hello from script.js</p>';
