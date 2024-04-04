# **🧨 Flood**

```js
const { Flood } = require('discord-gamecord');
const { ButtonStyle } = require('discord.js'):

const Game = new Flood({
  message: message,
  isSlashGame: false,
  embed: {
    title: 'Flood',
    color: '#5865F2',
  },
  difficulty: 13,
  timeoutTime: 60000,
  buttonStyle: ButtonStyle.Primary,
  emojis: ['🟥', '🟦', '🟧', '🟪', '🟩'],
  winMessage: 'You won! You took **{turns}** turns.',
  loseMessage: 'You lost! You took **{turns}** turns.',
  playerOnlyMessage: 'Only {player} can use these buttons.'
});

Game.startGame();
Game.on('gameOver', result => {
  console.log(result);  // =>  { result... }
});
```


## **🔖 Game Modes**
```js
Easy Mode   => 8
Normal Mode => 13
Hard Mode   => 18
```

