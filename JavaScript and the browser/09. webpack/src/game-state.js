// Game state class for playing Rock, Paper, Scissers against the computer
//
// Available methods:
//   * constructor() -- Create game room
//   * addEventListener('event name', function) -- available events:
//     * opponentChose
//     * scoresChanged
//     * gameEnd
//   * start() -- Start the game!
//   * resetScores() -- Set both scores back to zero
//   * choose(choice) -- Choose this option from the three options
//
// Available properties:
//   * options -- What can I choose from?

export default class GameState {
  constructor() {
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

    this._choices = {};
    this._scores = {};
    this._events = {};
    this.resetScores();
  }

  addEventListener(event, func) {
    this._events[event] ??= [];
    this._events[event].push(func);
  }

  start() {
    this._makeRandomChoice();
  }

  _makeRandomChoice() {
    window.setTimeout(() => {
      const choice = this.options[Math.floor(Math.random() * this.options.length)];
      this._choices.opponent = choice;
      this._fireEvent('opponentChose');
      this._checkChoices();
    }, Math.floor(Math.random() * 7000));
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
    this._checkChoices();
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
    this._makeRandomChoice()
  }
}
