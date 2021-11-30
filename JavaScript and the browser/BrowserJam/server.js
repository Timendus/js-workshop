#!/usr/bin/env node

const express = require('express');
const app = express();
const server = require('http').Server(app);

app.get('/status', (req, res) => {
  res.set("Content-Type", "text/plain");
  let status = 'Games:\n';
  for ( const game in games ) {
    status += `  * ${game}\n`;
    for ( const room in games[game] ) {
      status += `    - ${room} (${games[game][room]} players)`;
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

const config = {
  "port": 3000,
  "verbose": true
};

const names = {};
const games = {};

function log(...msg) {
  if (!config.verbose) return;
  console.log(...msg);
}

function updateGames(game, room) {
  games[game] ??= {};
  games[game][room] = io.of(`${game}--${room}`).sockets.size;
}

function join(socket, game, room, name) {
  socket.join(game);
  socket.join(`${game}--${room}`);
  io.to(`${game}--${room}`).emit('join', name);
  io.to(`${game}--${room}`).emit('clients', io.of(`${game}--${room}`).sockets.size);
  updateGames(game, room);
}

function leave(socket, game, room) {
  if ( room ) {
    log("Client left game", game, "and room", room);
    socket.leave(`${game}--${room}`);
    io.to(`${game}--${room}`).emit('leave', names[`${socket.id}--${game}--${room}`] || 'Unknown');
    io.to(`${game}--${room}`).emit('clients', io.of(`${game}--${room}`).sockets.size);
    updateGames(game, room);
  } else {
    log("Client left game", game);
    socket.leave(game);
  }
}

io.on('connection', socket => {

  log("Client connected on socket", socket.id);

  socket.on('list', game => socket.emit('list', games[game]));

  socket.on('join', ({game, room, name}) => {
    log("Client joined game", game, "and room", room);
    names[socket.id] ??= name;
    names[`${socket.id}--${game}`] ??= name;
    names[`${socket.id}--${game}--${room}`] = name;
    join(socket, game, room, name);
  });

  socket.on('leave', ({game, room}) =>
    leave(socket, game, room));

  socket.on('send', ({game, room, message, echo}) =>
    (echo ? io : socket).to(`${game}--${room}`)
                        .emit('message', {game, room, message}));

  socket.on('broadcast', ({game, message}) =>
    io.to(game).emit('broadcast', {game, message}));

  socket.on('disconnecting', () => {
    for ( const socketroom of socket.rooms ) {
      if ( socketroom != socket.id ) {
        const [ game, gameroom ] = socketroom.split('--');
        leave(socket, game, gameroom);
      }
    }
  });

  socket.on('disconnect', () =>
    log("Client disconnected on socket", socket.id));

});

server.listen(config.port, () =>
  console.log(`Server is listening on port ${config.port}`));
