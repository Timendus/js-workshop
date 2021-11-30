const socket = io("http://localhost:3000");

document.addEventListener('DOMContentLoaded', () => {
  const button = document.querySelector('button');
  const section = document.querySelector('section');
  const counter = document.getElementById('counter');
  let count = 0;

  button.addEventListener('click', e => {
    socket.emit('join', {
      game: 'MyGame',
      room: 'lobby',
      name: 'Mister Awesome'
    });
  });
});
