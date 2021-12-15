const socket = io("https://browserjam-event-server.herokuapp.com");

document.addEventListener('DOMContentLoaded', () => {

  const section = document.querySelector('section');
  const userChoice = document.querySelector('#user_choice');
  const compChoice = document.querySelector('#comp_choice');
  const result = document.querySelector('#result');
  const waiting = document.querySelector('#waiting-message');

  const roomID =  window.location.hash.length > 0 ? window.location.hash : Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  window.location.hash = roomID;
  const players = {};
  let myChoice = {}
  let otherChoice = {}

  socket.on('join', (player) => {
    players[player.id] = player
  });
  socket.on('update', player => players[player.id] = player);
  socket.on('leave', player => {
    delete players[player.id]
  });

  function checkChoice(mine, other) {
    if ( mine.beats == other.name ) {
      result.innerHTML = 'You Win!';
      result.classList.add('win');
      document.body.style.background = 'linear-gradient(135deg, #1ba0ff, #1bffb5)';
      scores.human++;
    } else if (other.beats == mine.name ) {
      result.innerHTML = 'Computer Wins!';
      result.classList.add('lose');
      document.body.style.background = 'linear-gradient(135deg, #ff1b99, #ffa41b)';
      scores.other++;
    } else {
      result.innerHTML = 'You tied!';
      result.classList.add('tie');
      document.body.style.background = 'linear-gradient(135deg, #ffcf1b, #ff8b1b)';
    }

    // Update state
    waiting.innerHTML = '';
    myChoice = {};
    otherChoice = {}
    document.getElementById("computer_score").innerHTML = scores.other;
    document.getElementById("user_score").innerHTML = scores.human;
  }

  socket.on('message', (message, player) => {
    if (Object.entries(myChoice).length !== 0) {
      checkChoice(myChoice, message.chosen)
    } else {
      otherChoice = message.chosen;
      waiting.innerHTML = "The other is waiting for you, hurry up now :)"
    }
  });

  socket.emit('join', {
      room: roomID,
      player: {
          name: "Jannie",
          score: 0
      }
  });

  const scores = {
    human: 0,
    other: 0
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

  // Show the choices the user can make as buttons
  choices.forEach(choice => {
    const choiceElm = document.createElement('button');
    choiceElm.id = choice.name;
    choiceElm.classList.add('far');
    choiceElm.classList.add(choice.icon);
    section.appendChild(choiceElm);
  });

  // Handle the "game logic" when the user clicks a button
  section.addEventListener('click', e => {
    // Which choice did we make?
    const choice = choices.find(c => c.name == e.target.id);
    if ( !choice ) return;
    userChoice.innerHTML = `You choose <span>${choice.name.toUpperCase()}</span>`;
    compChoice.innerHTML = '';
    result.innerHTML = '';
    result.classList = [];
    myChoice = choice;
    if (Object.entries(otherChoice).length !== 0) {
      checkChoice(myChoice, otherChoice);
      socket.emit('message', {
        chosen: choice,
      }, false);
    } else {
      waiting.innerHTML = "You are the first, let's wait for the other"
      socket.emit('message', {
        chosen: choice,
      }, false);
    }
  });

});
