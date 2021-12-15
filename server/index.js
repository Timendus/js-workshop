#!/usr/bin/env node

const express = require('express');
const app = express();
const server = require('http').Server(app);

const config = {
  "port": process.env['PORT'] || 3000,
  "verbose": true
};

app.get('/status', (req, res) => {
  res.set("Content-Type", "text/plain");
  let status = 'Games:\n';
  for ( const game in games ) {
    status += `  * ${game}\n`;
    for ( const room in games[game] ) {
      status += `    - ${room} (${games[game][room].players.length} players)`;
    }
  }
  res.send(status);
});

const io = require('socket.io')(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  serveClient: false
});

function log(socket, ...msg) {
  if (!config.verbose) return;
  if ( socket ) {
    let room = [...socket.rooms].find(r => r != socket.id);
    if ( room )
      room = ` --> ${room}`;
    else
      room = '';
    console.log(`${socket.nsp.name}${room} |`, ...msg, `(${socket.id})`);
  } else {
    console.log(...msg);
  }
}

function leave(socket) {
  const player = { id: socket.id };
  const room = [...socket.rooms].find(r => r != socket.id);
  if ( !room ) return;
  log(socket, `Client left room`);
  socket.to(room).emit('leave', player);
  socket.leave(room);

  // If room is gone, delete room state
  if ( socket.nsp.adapter.rooms.get(room) == undefined && socket.nsp.roomStates && socket.nsp.roomStates[room] ) {
    delete socket.nsp.roomStates[room];
    log(socket, `Cleaned up room ${room}`);
  }
}

function target(socket, echo) {
  return (echo ? socket.nsp : socket).to(myRoom(socket));
}

function myRoom(socket) {
  return [...socket.rooms].find(r => r != socket.id);
}

// Allow any namespace that contains letters, numbers, dash and underscore
io.of(/^\/[\w\-]+$/).on('connection', socket => {

  log(socket, `New client entered game`);

  socket.on('list', callback => callback(Object.keys(socket.nsp.roomStates)));

  socket.on('join', ({room, player}) => {
    // Make sure player isn't in another room
    leave(socket);

    // Sanitize input
    room ||= 'lobby';
    player ||= {};
    player.id = socket.id;

    // Make sure client receives messages for this room:
    socket.join(room);

    // Store player and room state
    socket.player = player;
    socket.nsp.roomStates ??= {};
    socket.nsp.roomStates[room] ??= { player, state: null };

    log(socket, `Client entered room`);

    // Send the new player to the existing clients
    socket.to(room).emit('join', player);

    // Send the current room state to the new client
    socket.emit('state', socket.nsp.roomStates[room]);
    // Send the existing clients to the new client
    socket.nsp.adapter.rooms.get(room).forEach(id =>
      socket.emit('join', socket.nsp.sockets.get(id).player));
  });

  socket.on('leave', () => leave(socket));
  socket.on('disconnecting', () => leave(socket));
  socket.on('disconnect', () => log(socket, `Client disconnected`));

  socket.on('update', player => {
    player.id = socket.id;
    socket.player = player;
    target(socket, true).emit('update', player);
  });

  socket.on('message', ({message, echo}) => {
    target(socket, echo).emit('message', {
      player: socket.player,
      message
    });
  });

  socket.on('broadcast', ({message, echo}) =>
    (echo ? socket.nsp : socket).emit('broadcast', message)
  );

  socket.on('state', ({state, echo}) => {
    const newState = { player: socket.player, state };
    socket.nsp.roomStates[myRoom(socket)] = newState;
    target(socket, echo).emit('state', newState);
  });

});

server.listen(config.port, () =>
  console.log(`Server is listening on port ${config.port}`));
