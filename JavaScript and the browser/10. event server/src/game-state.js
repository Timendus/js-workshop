// Game state class for a two player Rock, Paper, Scissers game.
//
// Available methods:
//   * constructor([roomID]) -- Create game room with optional ID
//   * addEventListener('event name', function) -- available events:
//     * numPlayersChanged
//     * socketDisconnect
//     * opponentChose
//     * scoresChanged
//     * gameEnd
//   * start() -- Start the game!
//   * resetScores() -- Set both scores back to zero
//   * choose(choice) -- Choose this option from the three options
//
// Available properties:
//   * roomId -- Which room are we in?
//   * options -- What can I choose from?

export default class GameState {
  constructor(roomId = false) {
    this.roomId = roomId || this._generateRoomId();
    this.options = [
      {
        name: 'Rock',
        icon: 'fa-hand-rock',
        beats: 'Scissors'
      },
      {
        name: 'Paper',
        icon: 'fa-hand-paper',
        beats: 'Rock'
      },
      {
        name: 'Scissors',
        icon: 'fa-hand-scissors',
        beats: 'Paper'
      }
    ];

    this._socket = io("https://browserjam-event-server.herokuapp.com/rock-paper-scissors");
    this._players = {};
    this._choices = {};
    this._scores = {};
    this._events = {};
    this._setupEventListeners();
    this.resetScores();
  }

  addEventListener(event, func) {
    this._events[event] ??= [];
    this._events[event].push(func);
  }

  start() {
    this._socket.emit('join', { room: this.roomId });
  }

  resetScores() {
    this._scores = {
      me: 0,
      opponent: 0
    };
    this._fireEvent('scoresChanged', { ...this._scores });
  }

  choose(choice) {
    this._choices.me = choice;
    // Send my choice to the other player
    this._socket.emit('message', choice, { echo: false });
    this._checkChoices();
  }

  _generateRoomId() {
    return Math.random().toString(36).substring(2, 15) +
           Math.random().toString(36).substring(2, 15);
  }

  _setupEventListeners() {
    this._socket.on('join', player => {
      this._players[player.id] = player;
      this._fireEvent('numPlayersChanged', Object.keys(this._players).length);
    });

    this._socket.on('leave', player => {
      delete this._players[player.id];
      this._fireEvent('numPlayersChanged', Object.keys(this._players).length);
    });

    this._socket.on('message', (message, player) => {
      if ( message && !this._choices.opponent )
        this._fireEvent('opponentChose');
      this._choices.opponent = message;
      this._checkChoices();
    });

    this._socket.on('disconnect', () => this._fireEvent('socketDisconnect'));
  }

  _fireEvent(event, payload) {
    const handlers = this._events[event];
    if ( !handlers ) return;
    handlers.forEach(handler => handler(payload));
  }

  _checkChoices() {
    if ( !this._choices.me || !this._choices.opponent ) return;

    if ( this._choices.me.beats == this._choices.opponent.name ) {
      this._lastResult = 'WIN';
      this._scores.me++;
    } else if (this._choices.opponent.beats == this._choices.me.name ) {
      this._lastResult = 'LOSE';
      this._scores.opponent++;
    } else {
      this._lastResult = 'TIE';
    }

    this._fireEvent('scoresChanged', { ...this._scores });
    this._fireEvent('gameEnd', {
      choices: { ...this._choices },
      result: this._lastResult
    });
    this._choices = {};
  }
}
