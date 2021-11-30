document.addEventListener('DOMContentLoaded', () => {
  const button = document.body.lastElementChild;

  button.addEventListener('click', e => {
    console.log("Button clicked!");
  });

  // const button = document.querySelector('button');
  // const counter = document.getElementById('counter');
  //
  // let count = 0;
  // button.addEventListener('click', () => {
  //     count += 1;
  //     counter.innerText = count;
  // });
});
