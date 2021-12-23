document.addEventListener('DOMContentLoaded', () => {
  const button = document.querySelector('button');
  const section = document.querySelector('section');
  const counter = document.getElementById('counter');
  let count = 0;

  document.addEventListener('click', e => {
    console.log("Document clicked!");
  });

  section.addEventListener('click', e => {
    console.log("Section clicked!");
  });

  button.addEventListener('click', e => {
    // e.stopPropagation();

    // Optioneel:
    // e.preventDefault() ?
    // e.stopImmediatePropagation() ?

    count += 1;
    counter.innerText = count;
    console.log("Button clicked!");
  });
});
