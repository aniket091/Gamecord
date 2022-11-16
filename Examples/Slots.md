# **🎰 Slot Machine**

```js
const { Slots } = require('discord-gamecord');

const Game = new Slots({
  message: message,
  isSlashGame: false,
  embed: {
    title: 'Slot Machine',
    color: '#5865F2'
  },
  slots: ['🍇', '🍊', '🍋', '🍌']
});

Game.startGame();
Game.on('gameOver', result => {
  console.log(result);  // =>  { result... }
});
```