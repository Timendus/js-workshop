document.addEventListener('DOMContentLoaded', () => {

  const section = document.querySelector('section');
  const userChoice = document.querySelector('#user_choice');
  const compChoice = document.querySelector('#comp_choice');
  const result = document.querySelector('#result');

  const scores = {
    human: 0,
    computer: 0
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

    // What choice does the computer make?
    const computer = choices[Math.floor(Math.random() * choices.length)];
    window.setTimeout(() => compChoice.innerHTML =
      `Computer chooses <span>${computer.name.toUpperCase()}</span>`, 1000);

    // Who won?
    window.setTimeout(() => {
      if ( choice.beats == computer.name ) {
        result.innerHTML = 'You Win!';
        result.classList.add('win');
        document.body.style.background = 'linear-gradient(135deg, #1ba0ff, #1bffb5)';
        scores.human++;
      } else if ( computer.beats == choice.name ) {
        result.innerHTML = 'Computer Wins!';
        result.classList.add('lose');
        document.body.style.background = 'linear-gradient(135deg, #ff1b99, #ffa41b)';
        scores.computer++;
      } else {
        result.innerHTML = 'You tied!';
        result.classList.add('tie');
        document.body.style.background = 'linear-gradient(135deg, #ffcf1b, #ff8b1b)';
      }

      // Update scoreboard
      document.getElementById("computer_score").innerHTML = scores.computer;
      document.getElementById("user_score").innerHTML = scores.human;
    }, 1500);
  });

});
