const socket = io("https://browserjam-event-server.herokuapp.com");

document.addEventListener('DOMContentLoaded', () => {

  // Set up game data

  const keys = {};
  const puppets = {};
  const myPuppet = {
    id: random(0, 1000000000),
    x: random(-400, 400),
    y: random(-400, 400)
  };

  // Helper functions

  function random(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
  }

  function clockTick() {
    showPuppets();
    const updatedPuppet = moveMyPuppet();
    if ( updatedPuppet.x != myPuppet.x || updatedPuppet.y != myPuppet.y ) {
      myPuppet.x = updatedPuppet.x;
      myPuppet.y = updatedPuppet.y;
      broadcastMyPuppet()
    }
    window.requestAnimationFrame(clockTick);
  }

  function showPuppets() {
    for ( const puppet of Object.values(puppets) ) {
      let elm = document.getElementById(puppet.id);
      if ( !elm ) {
        elm = document.createElement('div');
        elm.classList.add('puppet');
        elm.id = puppet.id;
        document.getElementById('game').appendChild(elm);
      }
      elm.style.top = `${puppet.y + window.innerHeight/2}px`;
      elm.style.left = `${puppet.x + window.innerWidth/2}px`;
      const sprite = selectPuppetSprite(puppet.id);
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

  function moveMyPuppet() {
    const updatedPuppet = { ...myPuppet };
    updatedPuppet.x += keys[37] ? -1 : 0 + keys[39] ? 1 : 0;
    updatedPuppet.y += keys[38] ? -1 : 0 + keys[40] ? 1 : 0;
    return updatedPuppet;
  }

  function broadcastMyPuppet() {
    socket.emit('send', {
      game: 'Puppets',
      room: 'lobby',
      message: myPuppet,
      echo: true
    });
  }

  // Set up event listeners

  socket.on('message', ({game, room, message}) => {
    puppets[message.id] = message;
  });

  socket.on('join', broadcastMyPuppet);
  socket.on('leave', () => {
    for ( const id of Object.keys(puppets) ) {
      delete puppets[id];
    }
    broadcastMyPuppet();
  });

  window.addEventListener('keydown', e => keys[e.keyCode] = true);
  window.addEventListener('keyup', e => keys[e.keyCode] = false);

  // And start!

  socket.emit('join', {
    game: 'Puppets',
    room: 'lobby',
    name: 'Anonymous player'
  });

  broadcastMyPuppet();
  window.requestAnimationFrame(clockTick);

});
