# **🎩 Hangman**

```js
const { Hangman } = require('discord-gamecord');

const Game = new Hangman({
  message: message,
  isSlashGame: false,
  embed: {
    title: 'Hangman',
    color: '#5865F2'
  },
  hangman: { hat: '🎩', head: '😟', shirt: '👕', pants: '🩳', boots: '👞👞' },
  customWord: 'Gamecord',
  timeoutTime: 60000,
  theme: 'nature',
  winMessage: 'You won! The word was **{word}**.',
  loseMessage: 'You lost! The word was **{word}**.',
  playerOnlyMessage: 'Only {player} can use these buttons.'
});

Game.startGame();
Game.on('gameOver', result => {
  console.log(result);  // =>  { result... }
});
```

# **🔖 Themes**
```js
nature || sport || color || camp || fruit || discord || winter || pokemon
```