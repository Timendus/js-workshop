document.addEventListener('DOMContentLoaded', () => {

  const socket = io("https://browserjam-event-server.herokuapp.com/rock-paper-scissors");
  const section = document.querySelector('section');
  const userChoice = document.querySelector('#user_choice');
  const compChoice = document.querySelector('#comp_choice');
  const result = document.querySelector('#result');
  const waiting = document.querySelector('#waiting-message');

  // Set up game data

  const state = {
    players: {},
    choices: {},
    scores: {}
  };

  const choices = [
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

  // Helper functions

  function generateRoomId() {
    return Math.random().toString(36).substring(2, 15) +
           Math.random().toString(36).substring(2, 15);
  }

  function renderScores() {
    document.getElementById("opponent_score").innerHTML = state.scores.opponent;
    document.getElementById("user_score").innerHTML = state.scores.me;
  }

  function checkChoices() {
    if ( !state.choices.me || !state.choices.opponent ) return;

    if ( state.choices.me.beats == state.choices.opponent.name ) {
      result.innerHTML = 'You Win!';
      result.classList.add('win');
      document.body.style.background = 'linear-gradient(135deg, #1ba0ff, #1bffb5)';
      state.scores.me++;
    } else if (state.choices.opponent.beats == state.choices.me.name ) {
      result.innerHTML = 'Opponent Wins!';
      result.classList.add('lose');
      document.body.style.background = 'linear-gradient(135deg, #ff1b99, #ffa41b)';
      state.scores.opponent++;
    } else {
      result.innerHTML = 'You tied!';
      result.classList.add('tie');
      document.body.style.background = 'linear-gradient(135deg, #ffcf1b, #ff8b1b)';
    }

    waiting.innerText = 'Make a choice!';
    compChoice.innerHTML = `Opponent chose <span>${state.choices.opponent.name.toUpperCase()}</span>`;
    state.choices = {};
    renderScores();
  }

  function checkNumPlayers() {
    const numPlayers = Object.keys(state.players).length;
    if ( numPlayers == 2 ) {
      document.querySelector('#waiting-room').classList.remove('active');
      document.querySelector('main').classList.add('active');
      state.scores = {
          me: 0,
          opponent: 0
      };
      renderScores();
    } else {
      document.querySelector('#num-players').innerText = numPlayers;
      document.querySelector('#waiting-room').classList.add('active');
      document.querySelector('main').classList.remove('active');
    }
  }

  // Set up event listeners

  socket.on('join', player => {
    state.players[player.id] = player;
    checkNumPlayers();
  });

  socket.on('leave', player => {
    delete state.players[player.id];
    checkNumPlayers();
  });

  socket.on('message', (message, player) => {
    state.choices.opponent = message;
    waiting.innerText = 'Opponent is waiting for you...';
    checkChoices();
  });

  socket.on('disconnect', () => {
    alert('Connection lost. Reloading the page...');
    window.location.reload();
  });

  section.addEventListener('click', e => {
    // Which choice did we make?
    const choice = choices.find(c => c.name == e.target.id);
    if ( !choice ) return;
    waiting.innerText = 'Waiting for your opponent...';
    userChoice.innerHTML = `You choose <span>${choice.name.toUpperCase()}</span>`;
    compChoice.innerHTML = '';
    result.innerHTML = '';
    result.classList = [];
    // Save my choice
    state.choices.me = choice;
    // Send my choice to the other player
    socket.emit('message', choice, { echo: false });
    checkChoices();
  });

  // And start!

  // Show the choices the user can make as buttons
  choices.forEach(choice => {
    const choiceElm = document.createElement('button');
    choiceElm.id = choice.name;
    choiceElm.classList.add('far');
    choiceElm.classList.add(choice.icon);
    section.appendChild(choiceElm);
  });

  const roomId = window.location.hash ? window.location.hash.substr(1) : generateRoomId();

  // Show invite link
  const link = window.location.href.split("#")[0] + '#' + roomId;
  document.querySelector('#invite-link').innerHTML =
    `<a href="${link}">${link}</a>`;

  // Join the game!
  socket.emit('join', { room: roomId });

});
