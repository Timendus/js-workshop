#!/usr/bin/env node

const express = require('express');
const app = express();
const server = require('http').Server(app);

const games = {};
const players = {};

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

function log(...msg) {
  if (!config.verbose) return;
  console.log(...msg);
}

function addPlayer(game, room, player) {
  games[game] ||= {};
  games[game][room] ||= {};
  games[game][room].state ??= {
    player: playerWithoutSocket(player),
    state: null
  };
  games[game][room].players ||= [];
  games[game][room].players.push(player);
  players[player.id] = { game, room };
}

function removePlayer(game, room, player) {
  delete players[player.id];
  games[game][room].players = games[game][room].players.filter(p => p.id != player.id);
  if ( games[game][room].players.length == 0 ) {
    delete games[game][room];
    if ( Object.keys(games[game]).length == 0 )
      delete games[game];
  }
}

function leave(socket) {
  const player = { id: socket.id };
  const { game, room } = players[player.id] || {};
  if ( !game || !room ) return;
  log(`Client ${socket.id} left game ${game} and room ${room}`);
  socket.leave(game);
  socket.leave(`${game}--${room}`);
  removePlayer(game, room, player);
  io.to(`${game}--${room}`).emit('leave', player);
}

function playerWithoutSocket(player) {
  const { socket, ...newPlayer } = player;
  return newPlayer;
}

io.on('connection', socket => {

  log("Client connected on socket", socket.id);

  socket.on('list', game =>
    socket.emit('list', Object.keys(games[game])));

  socket.on('join', ({game, room, player}) => {
    // Make sure player isn't in another room
    leave(socket);

    // Sanitize input
    game ||= 'server';
    room ||= 'lobby';
    player ||= {};
    log(`Client ${socket.id} joined game ${game} and room ${room}`);

    // Make sure client receives messages for these channels:
    socket.join(game);
    socket.join(`${game}--${room}`);

    // Store the game/room/player on the server
    player.id = socket.id;
    player.socket = socket;
    addPlayer(game, room, player);

    // Send the existing clients the new player
    socket.to(`${game}--${room}`).emit('join', playerWithoutSocket(player));

    // Send the new client the current room state
    socket.emit('state', games[game][room].state);
    // Send the new client the existing clients
    games[game][room].players.map(p => playerWithoutSocket(p))
                             .forEach(player => socket.emit('join', player));
  });

  socket.on('leave', () => leave(socket));
  socket.on('disconnecting', () => leave(socket));
  socket.on('disconnect', () => log(`Client ${socket.id} disconnected`));

  socket.on('update', player => {
    // Where am I?
    player.id = socket.id;
    const { game, room } = players[player.id] || {};
    if ( !game || !room ) return;

    // Update player on the server
    games[game][room].players = games[game][room].players.map(p =>
      ( p.id == player.id ) ? player : p);

    // Update player on the clients
    io.to(`${game}--${room}`).emit('update', player);
  });

  socket.on('message', ({message, echo}) => {
    if ( !message ) return;
    const { game, room } = players[socket.id] || {};
    if ( !game || !room ) return;
    const player = games[game][room].players.find(p => p.id == socket.id);
    if ( !player ) return;
    (echo ? io : socket).to(`${game}--${room}`)
                        .emit('message', {
                          player: playerWithoutSocket(player),
                          message
                        });
  });

  socket.on('broadcast', ({game, message, echo}) =>
    (echo ? io : socket).to(game).emit('broadcast', message));

  socket.on('state', ({state, echo}) => {
    const { game, room } = players[socket.id] || {};
    if ( !game || !room ) return;
    const player = games[game][room].players.find(p => p.id == socket.id);
    if ( !player ) return;
    games[game][room].state = { state, player: playerWithoutSocket(player) };
    (echo ? io : socket).to(`${game}--${room}`)
                        .emit('state', games[game][room].state);
  });

});

server.listen(config.port, () =>
  console.log(`Server is listening on port ${config.port}`));
