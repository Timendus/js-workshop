# BrowserJam Event Server

We want you to have fun in the browser, and not spend half of your time (or half
of your team) on messing around trying to hack together a back-end. At the same
time we really do welcome multiplayer games, because we can all appreciate some
multiplayer fun with colleagues and friends with all this working from home! 👾🕹

So we have built this very simple NodeJS Event Server for you. And we're hosting
it for you too, while we're at it. So if this server suffices for your game
idea, you only need to supply a client application!

And if not, feel free to adapt the server to meet your own needs. It's written
in Javascript (obviously) and it's just 152 lines of code. Much less than this
README, in fact 😉

Please note though that this being an open, shared server, there is **absolutely
no security**. Anyone can come and mess up your game or listen in on your
communications. Please be aware of this.

## Basics

The BrowserJam Event Server is, as its name suggests, event based. It is not a
classic request-response server. We think that this paradigm fits better with
the concepts from the JavaScript workshop and also lends itself better to
multiplayer games.

You communicate with the server through the
[socket.io](https://socket.io/docs/v4/) client, which uses WebSockets under the
hood and can automatically fall back to polling over HTTP if needed. This README
should provide you with everything you need to know to get started.

## Installing

To load the client, put this in your `head` section:

```html
<script src="https://cdn.socket.io/3.1.3/socket.io.min.js" integrity="sha384-cPwlPLvBTa3sKAgddT6krw0cJat7egBga3DJepJyrLl4Q9/5WLra3rrnMcyTyOnh" crossorigin="anonymous"></script>
```

Or install through NPM or Yarn if you're using a bundler:

```bash
npm install --save socket.io-client
```

```javascript
const { io } = require("socket.io-client");
```

Either approach should result in you having access to a variable called `io`.

## Instantiating

### Using the hosted version

This server is being hosted on Heroku for your convenience. To use the hosted
server, instantiate `socket` like so:

```javascript
const socket = io("https://browserjam-event-server.herokuapp.com/MyGame");
```

**Note the identifier `MyGame` at the end of the URI**. Supplying your own
unique game identifier as the last part of the path makes sure that you will
not have issues with other developers using the same server. Any string of
lower and upper case characters, numbers, dashes and underscores is a valid
game identifier.

### Using a local server

Or you can run a local version of the server:

```bash
git clone git@github.com:Timendus/js-workshop.git
cd js-workshop
npm install
npm start
```

Then in your web application:

```javascript
const socket = io("http://localhost:3000/MyGame");
```

## API

### Introduction

There are three mechanisms at play through which you can have your clients share
state. You can mix and match which mechanisms you use in your game. We will
broadly describe all three mechanisms.

In all three cases the state itself can be pretty much any JavaScript type, like
a single number, a string, an object, an array or whatever you need.

#### Rooms and room state

Your game server has a concept of `rooms`. They will be created and destroyed on
the fly when players join them and leave them. One client can only be in one
room at a time. You will always have at least the default room `lobby`, you can
choose to come up with more rooms yourself.

Each room also has a `state`, that will persist as long as the room exists. All
players can change the state of the room, which will immediately be shared with
all other players in the room. For example, if you would be making a board game,
this would be a representation of the board. Using more rooms than just the
`lobby`, you can have players play on multiple boards at the same time. Or the
`lobby` can be the one shared state of your massive multiplayer online world
that your players move through.

#### Player state

Players can `join` and `leave` rooms, which will trigger events for all other
players in the same room. Players can also `update` themselves. First, this
gives you full knowlegde of the presence of other players in the room. Second, a
player can have a `state` that will be shared with all other players, like for
example their name, coordinates, speed, health or other stats. Players can only
update their own state. This is the only "security feature" in the whole server
😉

#### Message broadcasting

Any player can send an arbitrary `message` to the room that they are in. All
other players **in the same room** will receive this message. This can for
example be used for in-game chat, or maybe your players can trade cards with
each other.

Additionally, any player can send a `broadcast` to all players in the game. This
broadcast will be received by all players **in all rooms**. You can use
broadcasts for example to coordinate game start and end times across rooms.

You can of course also use these two events to implement your own more
sophisticated protocol on top of them.

### Events from client to server

#### `join`

Players first have to join either the game or a specific room. Joining makes it
so that the client will receive any messages sent and see other players come and
go. If you specify a room, the client will be constrained to just that room.
Otherwise all players of your game will be in the same default room `lobby`.

Rooms are created automatically when the first client joins, and destroyed
automatically when the last client leaves.

When joining, you can supply an initial state for your player.

```javascript
socket.emit('join', {
  room: 'lobby',  // Optional room name, will default to 'lobby'
  player: {       // Optionally initialise this player's state
    name: 'Mister Bean'
  }
});
```

#### `update`

Once joined, players can update their own state. Players can only update
themselves, not each other.

```javascript
socket.emit('update', {
  name: 'Misses Bean'
});
```

#### `leave`

To cleanly leave a room in your game (when a player switches rooms, or goes game
over and starts a new game?) you can instruct the server to remove the current
client from the room. Joining a new room will also auto-leave the previous room
first.

```javascript
socket.emit('leave');
```

#### `state`

Any client can update the state of the room they are currently in:

```javascript
const roomState = {
  roomTopic: 'How do you like JavaScript in 2021?'
};

socket.emit('state', roomState);
```

#### `list`

When you send a `list` event to the server, you will get a callback with a list
of room names currently open in your game. This uses the socket.io mechanism
called [Acknowledgements](https://socket.io/docs/v4/emitting-events/#acknowledgements).

```javascript
socket.emit('list', rooms => console.log(rooms));
```

#### `message`

To send an arbitrary message to the room you're currently in, emit a `message`
event. All clients currently in the same room will receive a `message` event.

```javascript
socket.on('message', (message, player) => {
  // `player` is whoever sent the message
  // `message` is the message content
  console.log(message, player);
});

const arbitraryMessage = {
  about: 'Cup of tea',
  pleaseRemember: 'With sugar please'
};

socket.emit('message', arbitraryMessage);
```

#### `broadcast`

To send an arbitrary broadcast to all connected clients in your game, regardless
of which room they are in, emit a `broadcast` event.

```javascript
socket.on('broadcast', message => {
  console.log(message);
});

socket.emit('broadcast', [1,2,3,4]);
```

### Events from server to client

#### `join`

As soon as you join a new room, `join` events will fire for all players already
in the room and any player joining at a later time.

```javascript
const players = {};

socket.on('join', player => {
  // `player` is the player's state with an additional unique id that's defined
  // by the server. You can use this id to store the player, if you wish:
  players[player.id] = player;

  if ( player.id == socket.id ) {
    // This player is me!
  }
});
```

#### `update`

Any time a player updates their own state, an `update` event will be fired.

```javascript
socket.on('update', player => {
  // `player` is the player's new state, with the same additional unique id
  // that's defined by the server as when they joined
 players[player.id] = player;

 if ( player.id == socket.id ) {
   // This player is me!
 }
});
```

#### `leave`

Any time a player leaves the room, a `leave` event will fire.

```javascript
socket.on('leave', player => {
  // `player` is an object with only the player id in it. You can use this id to
  // delete the player:
  delete players[player.id];
  // ... do additional cleanup if needed

  if ( player.id == socket.id ) {
    // This player is me!
  }
});
```

#### `disconnect`

When your client loses its connection to the server, a `disconnect` event will
fire. When your client reconnects, having missed a couple of events, their state
may diverge from the rest of the clients and they may have gotten a new
`player.id`. This is an issue, so it is recommended to listen to this
`disconnect` event and handle it in a way that brings the client back in sync
with the global state. One fairly ugly but simple and effective way to handle
this would be something like this:

```javascript
socket.on('disconnect', () => {
  alert('Connection lost. Reloading the page...');
  window.location.reload();
});
```

#### `state`

The `state` event will fire when you first join a room or when another player
changes the room state. By default the room state is `null`, which can be used
to detect if you are the first player in a room.

```javascript
socket.on('state', (state, player) => {
  // `player` is whoever last changed the state
  // `state` is the current state of the room

  if ( state == null )
    // Initialise the room state
    socket.emit('state', { ... });
  else
    // Update internal game state to match room state
});
```

### Disabling echos

By default, anything you do will also trigger an event on the sending client.
For some situations this may not be desired. You can disable this behaviour on a
per-call basis by supplying `false` as a third argument to `emit`. This only
works for `state`, `message` and `broadcast`.

```javascript
socket.emit('message', 'Stop echoing back!', false);
```
