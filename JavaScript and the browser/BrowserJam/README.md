# BrowserJam Event Server

We want you to have fun in the browser, and not spend half of your time (or half
of your team) on messing around trying to hack together a back-end. At the same
time we really do welcome multiplayer games, because we can all appreciate some
multiplayer fun with colleagues and friends with all this working from home!

So we have built this very simple NodeJS Event Server for you. And we'll host it
too, while we're at it. So if what this server can offer you is enough, you need
only supply a web client.

## Event based

Blahblah

## Use hosted version

Available at...

```javascript
const socket = io("http://localhost:3000");
```

## To run locally

```bash
git clone git@github.com:Timendus/js-workshop.git
cd js-workshop/JavaScript\ and\ the\ browser/BrowserJam/
npm install
npm start
```

Then in your web application:

```javascript
const socket = io("http://localhost:3000");
```

## API

### `join`

Players can join a room on your game. If your game has only a single room, just
use the same room name or leave out the room. Joining a room makes it so that
client will receive any messages sent in that room.

```javascript
socket.emit('join', {
  game: 'MyGame',
  room: 'lobby',
  name: 'Mister Bean'
});
```

### `leave`

To cleanly leave a room in your game (when a player switches rooms, or goes game
over and starts a new game?) you can instruct the server to remove the current
client from the room:

```javascript
socket.emit('leave', {
  game: 'MyGame',
  room: 'lobby'
});
```

### `list`

To get a list of all available rooms in your game, emit a `list` event to the
server with your game name as a parameter. You will get a `list` event back with
the answer.

```javascript
socket.on('list', list => console.log(list));
socket.emit('list', { game: 'MyGame' });
```

### `send`

To send an arbitrary message to the room you're currently in, emit a `send`
event. All clients currently joined in the same room will receive a `message`
event. By default the message does not trigger an event on the sending client,
but you can enable that if required. Messages can be strings, but other
JavaScript primitives and objects are fine too.

```javascript
socket.on('message', ({game, room, message}) => {
  console.log(message);
});

socket.emit('send', {
  game: 'MyGame',
  room: 'lobby',
  message: {
    playerX: 1545,
    playerY: 459
  },
  echo: true // Optional
});
```

### `broadcast`

Finally, for fun and giggles, you can broadcast a message to all connected
clients that are in your game (regardless of room). To do this, emit a
`broadcast` event and all clients will receive a `broadcast` event with the same
message. Again, messages can be anything.

```javascript
socket.on('broadcast', ({game, message}) => {
  console.log(message);
});

socket.emit('broadcast', {
  game: 'MyGame',
  message: [1,2,3,4]
});
```
