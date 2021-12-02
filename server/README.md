# BrowserJam Event Server

We want you to have fun in the browser, and not spend half of your time (or half
of your team) on messing around trying to hack together a back-end. At the same
time we really do welcome multiplayer games, because we can all appreciate some
multiplayer fun with colleagues and friends with all this working from home! 👾🕹

So we have built this very simple NodeJS Event Server for you. And we're hosting
it for you too, while we're at it. So if this server suffices for your game
idea, you only need to supply a client!

And if not, feel free to adapt the server to meet your own needs. It's written
in Javascript (obviously) and it's just 160 lines of code. Much less than this
README 😉

Please note though that this being an open, shared server, there is absolutely
no security. Anyone can come and mess up your game or listen in on your
communications. Please be aware of this.

## Basics

The BrowserJam Event Server is, as its name suggests, event based. It is not a
classic request-response server. We think that this paradigm fits better with
the concepts from the JavaScript workshop and also lends itself better to
multiplayer games.

You communicate with the server through the
[socket.io](https://socket.io/docs/v4/) client, which uses WebSockets under the
hood and can automatically fall back to polling over HTTP if needed.

To load the client, put this in your `head` section:

```html
<script src="https://cdn.socket.io/3.1.3/socket.io.min.js" integrity="sha384-cPwlPLvBTa3sKAgddT6krw0cJat7egBga3DJepJyrLl4Q9/5WLra3rrnMcyTyOnh" crossorigin="anonymous"></script>
```

Or install through npm if you're using a bundler:

```bash
npm install --save socket.io-client
```

```javascript
const { io } = require("socket.io-client");
```

## Instantiating

### Using the hosted version

This server is being hosted on Heroku for your convenience. To use the hosted
server, instantiate `socket` like so:

```javascript
const socket = io("https://browserjam-event-server.herokuapp.com");
```

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
const socket = io("http://localhost:3000");
```

## API

### Introduction

This server has a concept of `games` and of `rooms`. Both will be created and
destroyed on the fly when players join them and leave them. One client can only
be in one game and one room at a time. Within your game, you will always have at
least the default room 'lobby', and you can choose to add more yourself.

There are three mechanisms at play through which you can have your clients share
state. You can mix and match which mechanisms you use in your game. In all three
cases the state can be pretty much any JavaScript variable. We will broadly
describe all three mechanisms.

#### Player state

Players can `join` and `leave` the room, which will trigger events for all other
players in the room. Players can also `update` themselves. First, this gives you
full knowlegde of the presence of other players. Second, a player can have a
state that will be shared with all other players, like for example their name,
coordinates, speed, health or other stats. Players can only update their own
state.

#### Room state

Each room also has a `state`, that will persist as long as the room exists. All
players can change the state of the room, which will immediately be shared with
all other players in the room. For example, if you would be making a board game,
this would be a representation of the board. Or it can be the state of the world
that your players move through.

#### Message broadcasting

Any player can send an arbitrary `message` to the room that they are in. All
other players will receive this message. This can for example be used for
in-game chat, or maybe your players can trade cards with each other.
Additionally, any player can send a `broadcast` to all players in the game. This
broadcast will be received by all players in all rooms within your game. You can
use broadcasts for example to coordinate game start and end times across rooms.
But you can also use these two events to implement your own more sophisticated
protocol.

### Events from client to server

#### `join`

Players first have to join your game. Joining makes it so that this client will
receive any messages sent in your game, and see other players come and go. If
you specify a room, the client will be constrained to just that room. Otherwise
all players of your game will be in the same default room.

Games and rooms are created automatically when the first client joins, and
destroyed automatically when the last client leaves.

When joining, you can supply an initial state for your player.

```javascript
socket.emit('join', {
  game: 'MyGame', // A unique and constant identifier of your game
  room: 'lobby',  // Optional room name, will default to 'lobby'
  player: {       // Optionally initialise this player's state
    name: 'Mister Bean'
  }
});
```

#### `update`

Once in a room, players can update their own state. Players can only update
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

Any client can update the state of the room they are currently in. By default
this does not trigger an event on the sending client, but you can enable that if
required.

```javascript
socket.emit('state', {
  state: {
    roomTopic: 'How do you like JavaScript in 2021?'
  },
  echo: true // Optional
});
```

#### `list`

To get a list of all available rooms in your game, emit a `list` event to the
server with your game name as a parameter. You will get a `list` event back with
the answer.

```javascript
socket.on('list', list => console.log(list));
socket.emit('list', 'MyGame');
```

#### `message`

To send an arbitrary message to the room you're currently in, emit a `message`
event. All clients currently in the same room will receive a `message` event. By
default the message does not trigger an event on the sending client, but you can
enable that if required.

```javascript
socket.on('message', ({player, message}) => {
  console.log(message);
});

socket.emit('message', {
  message: {
    subject: 'Cup of tea',
    contents: 'With sugar please'
  },
  echo: true // Optional
});
```

#### `broadcast`

To send an arbitrary broadcast to all connected clients in your game, emit a
`broadcast` event. All clients currently joined in any rooms of the given game
will receive a `broadcast` event. By default the broadcast does not trigger an
event on the sending client, but you can enable that if required.

```javascript
socket.on('broadcast', message => {
  console.log(message);
});

socket.emit('broadcast', {
  game: 'MyGame',
  message: [1,2,3,4],
  echo: true // Optional
});
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

#### `state`

The `state` event will fire when you first join a room or when another player
changes the room state. By default the room state is `null`, which can be used
to detect if you are the first player in a room.

```javascript
socket.on('state', ({player, state}) => {
  // `player` is whoever last changed the state
  // `state` is the current state of the room

  if ( state == null )
    // Initialise the room state
    socket.emit('state', { state: ... })
  else
    // Update internal game state to match room state
});
```

#### `list`

When you send a `list` event to the server, you will get one back with the list
of currently available rooms for the given game.

```javascript
socket.on('list', list => console.log(list));
socket.emit('list', 'MyGame');
```

#### `message`

The `message` event will fire when another player sends a `message` event to the
server.

```javascript
socket.on('message', ({player, message}) => {
  // `player` is whoever sent the message
  // `message` is the message content
  console.log(message);
});
```

#### `broadcast`

The `broadcast` event will fire when another player sends a `broadcast` event to
the server.

```javascript
socket.on('broadcast', message => {
  // `message` is the broadcast content
  console.log(message);
});
```
