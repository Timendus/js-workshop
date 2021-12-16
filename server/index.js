#!/usr/bin/env node

const express = require('express');
const app = express();
const server = require('http').Server(app);
const namespaces = {};

const config = {
  "port": process.env['PORT'] || 3000,
  "verbose": true
};

app.get('/status', (req, res) => {
  res.set("Content-Type", "text/plain");
  let status = 'Games:\n';
  for ( const game in namespaces ) {
    status += `  * ${game}\n`;
    if ( !namespaces[game].roomStates ) continue;
    for ( const room in namespaces[game].roomStates ) {
      const numClients = namespaces[game].adapter.rooms.get(room)?.size;
      if ( numClients === undefined ) continue;
      status += `    - ${room} (${numClients})\n`;
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

function target(socket, options, toRoom = true) {
  options = {
    echo:     true,     // <-- Default values
    volatile: false,
    ...options
  };

  let target = options.echo ? socket.nsp : socket;
  target = options.volatile ? target.volatile : target;
  return toRoom ? target.to(myRoom(socket)) : target;
}

function myRoom(socket) {
  return [...socket.rooms].find(r => r != socket.id);
}

// Allow any namespace that contains letters, numbers, dash and underscore
io.of(/^\/[\w\-]+$/).on('connection', socket => {

  log(socket, `New client entered game`);

  socket.on('list', callback => callback(Object.keys(socket.nsp.roomStates)));

  socket.on('join', joinEvent => {
    // Make sure player isn't in another room
    leave(socket);

    // Sanitize input
    joinEvent ||= {}
    const room = joinEvent.room || 'lobby';
    const player = joinEvent.player || {};
    player.id = socket.id;

    // Make sure client receives messages for this room:
    socket.join(room);

    // Store player and room state
    socket.player = player;
    socket.nsp.roomStates ??= {};
    socket.nsp.roomStates[room] ??= { player, state: null };

    // Done with bookkeeping!
    log(socket, `Client entered room`);

    // Send the new player to the existing clients
    socket.to(room).emit('join', player);

    // Send the current room state to the new client
    const state = socket.nsp.roomStates[room];
    socket.emit('state', state.state, state.player);

    // Send the existing clients to the new client
    socket.nsp.adapter.rooms.get(room).forEach(id =>
      socket.emit('join', socket.nsp.sockets.get(id).player));
  });

  socket.on('leave', () => leave(socket));
  socket.on('disconnecting', () => leave(socket));

  socket.on('update', (player, options) => {
    player.id = socket.id;
    socket.player = player;
    target(socket, options).emit('update', player);
  });

  socket.on('message', (message, options) =>
    target(socket, options).emit('message', message, socket.player));

  socket.on('broadcast', (message, options) =>
    target(socket, options, false).emit('broadcast', message));

  socket.on('state', (state, options) => {
    const newState = { player: socket.player, state };
    socket.nsp.roomStates[myRoom(socket)] = newState;
    target(socket, options).emit('state', newState.state, newState.player);
  });

  // Keep a reference to the namespaces currently in use so the `/status` API
  // can actually show something interesting

  namespaces[socket.nsp.name] ??= socket.nsp;

  socket.on('disconnect', () => {
    log(socket, `Client disconnected`);

    // If namespace is empty, delete namespace
    if ( socket.nsp.sockets.size == 0 ) {
      delete namespaces[socket.nsp.name];
      console.log(`Cleaned up game ${socket.nsp.name}`);
    }
  });

});

server.listen(config.port, () =>
  console.log(`Server is listening on port ${config.port}`));
