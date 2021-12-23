import GameState from './game-state';

document.addEventListener('DOMContentLoaded', () => {

  const section = document.querySelector('section');
  const userChoice = document.querySelector('#user_choice');
  const compChoice = document.querySelector('#comp_choice');
  const result = document.querySelector('#result');
  const waiting = document.querySelector('#waiting-message');
  const state = new GameState(window.location.hash?.substr(1));

  // Set up event listeners

  state.addEventListener('numPlayersChanged', numPlayers => {
    if ( numPlayers == 2 ) {
      document.querySelector('#waiting-room').classList.remove('active');
      document.querySelector('main').classList.add('active');
      state.resetScores();
    } else {
      document.querySelector('#num-players').innerText = numPlayers;
      document.querySelector('#waiting-room').classList.add('active');
      document.querySelector('main').classList.remove('active');
    }
  });

  state.addEventListener('socketDisconnect', () => {
    alert('Connection lost. Reloading the page...');
    window.location.reload();
  });

  state.addEventListener('opponentChose', () => {
    waiting.innerText = 'Opponent is waiting for you...';
  });

  state.addEventListener('scoresChanged', scores => {
    document.getElementById("opponent_score").innerHTML = scores.opponent;
    document.getElementById("user_score").innerHTML = scores.me;
  });

  state.addEventListener('gameEnd', state => {
    switch(state.result) {
      case 'WIN':
        result.innerHTML = 'You Win!';
        result.classList.add('win');
        document.body.style.background = 'linear-gradient(135deg, #1ba0ff, #1bffb5)';
        break;
      case 'LOSE':
        result.innerHTML = 'Opponent Wins!';
        result.classList.add('lose');
        document.body.style.background = 'linear-gradient(135deg, #ff1b99, #ffa41b)';
        break;
      case 'TIE':
        result.innerHTML = 'You tied!';
        result.classList.add('tie');
        document.body.style.background = 'linear-gradient(135deg, #ffcf1b, #ff8b1b)';
        break;
    }

    waiting.innerText = 'Make a choice!';
    compChoice.innerHTML = `Opponent chose <span>${state.choices.opponent.name.toUpperCase()}</span>`;
  });

  section.addEventListener('click', e => {
    // Which choice did we make?
    const choice = state.options.find(c => c.name == e.target.id);
    if ( !choice ) return;
    waiting.innerText = 'Waiting for your opponent...';
    userChoice.innerHTML = `You choose <span>${choice.name.toUpperCase()}</span>`;
    compChoice.innerHTML = '';
    result.innerHTML = '';
    result.classList = [];
    state.choose(choice);
  });

  // And start!

  // Show the choices the user can make as buttons
  state.options.forEach(choice => {
    const choiceElm = document.createElement('button');
    choiceElm.id = choice.name;
    choiceElm.classList.add('far');
    choiceElm.classList.add(choice.icon);
    section.appendChild(choiceElm);
  });

  // Show invite link
  const link = window.location.href.split("#")[0] + '#' + state.roomId;
  document.querySelector('#invite-link').innerHTML =
    `<a href="${link}">${link}</a>`;

  // Start the game!
  state.start();

});
