const socket = io("http://localhost:3000/puppets-demo");

document.addEventListener('DOMContentLoaded', () => {

  // Set up game data

  const keys = {};
  const puppets = {};
  const chatTimeouts = {};
  const apple = {};

  // Helper functions

  function random(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
  }

  function clockTick() {
    showChat();
    showPuppets();
    moveMe();
    window.requestAnimationFrame(clockTick);
  }

  function showChat() {
    if ( keys[13] ) {
      document.getElementById('chat').classList.add('active');
      document.querySelector('#chat input').focus();
    }
  }

  function hideChat() {
    document.querySelector('#chat input').value = '';
    document.getElementById('chat').classList.remove('active');
    keys[13] = false;
  }

  function showPuppets() {
    for ( const puppet of Object.values(puppets) ) {
      let elm = document.getElementById('puppet-'+puppet.id);
      if ( !elm ) {
        elm = document.createElement('div');
        elm.classList.add('puppet');
        elm.id = 'puppet-'+puppet.id;
        const msg = document.createElement('span');
        elm.appendChild(msg);
        msg.classList.add('message');
        document.getElementById('game').appendChild(elm);
      }
      elm.style.top = `${puppet.y + window.innerHeight/2}px`;
      elm.style.left = `${puppet.x + window.innerWidth/2}px`;
      const sprite = selectPuppetSprite(puppet.sprite);
      elm.style.backgroundPosition = `-${sprite.x}px -${sprite.y}px`;
    };
  }

  function selectPuppetSprite(id) {
    id = id % 100;
    const x = id % 10;
    const y = Math.floor(id / 10);
    return {
      x: (96 + x * (64+8*16)) / 2,
      y: (96 + y * (64+8*16)) / 2
    };
  }

  function moveMe() {
    if ( !(keys[37] || keys[39] || keys[38] || keys[40]) ) return;
    const myPuppet = Object.values(puppets).find(p => p.id == socket.id);
    if ( !myPuppet ) return;
    myPuppet.x += keys[37] ? -2 : 0 + keys[39] ? 2 : 0;
    myPuppet.y += keys[38] ? -2 : 0 + keys[40] ? 2 : 0;
    socket.emit('update', myPuppet);

    if ( Math.abs(myPuppet.x - apple.x) < 40 &&
         Math.abs(myPuppet.y - apple.y) < 40 ) spawnApple();
  }

  function spawnApple() {
    socket.emit('state', {
      x: random(-400, 400),
      y: random(-400, 400)
    });
  }

  // Set up event listeners

  socket.on('join', puppet => puppets[puppet.id] = puppet);
  socket.on('update', puppet => puppets[puppet.id] = puppet);
  socket.on('leave', puppet => {
    document.getElementById('puppet-'+puppet.id).remove();
    delete puppets[puppet.id]
  });

  socket.on('state', (state, player) => {
    // If no state present on the server, initialise it
    if ( state == null ) {
      spawnApple();
      return;
    }

    apple.x = state.x;
    apple.y = state.y;

    const elm = document.getElementById('apple');
    elm.style.top = `${apple.y + window.innerHeight/2}px`;
    elm.style.left = `${apple.x + window.innerWidth/2}px`;
  });

  window.addEventListener('keydown', e => keys[e.keyCode] = true);
  window.addEventListener('keyup', e => keys[e.keyCode] = false);

  document.querySelector('#chat form').addEventListener('submit', e => {
    e.preventDefault();
    socket.emit('message', document.querySelector('#chat input').value);
    hideChat();
  });

  socket.on('message', (message, player) => {
    window.clearTimeout(chatTimeouts[player.id]);
    const popup = document.querySelector(`#puppet-${player.id} .message`);
    popup.innerText = message;
    popup.classList.add('active');
    chatTimeouts[player.id] = window.setTimeout(
      () => popup.classList.remove('active'),
      3000
    );
  });

  // And start!

  socket.emit('join', {
    player: {
      x: random(-400, 400),
      y: random(-400, 400),
      sprite: random(0,99)
    }
  });

  window.requestAnimationFrame(clockTick);

});
