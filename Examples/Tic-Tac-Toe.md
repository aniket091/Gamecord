# 🧩 Tic Tac Toe

```js
const { TicTacToe } = require('discord-gamecord')

new TicTacToe({
  message: message,
  opponent: message.mentions.users.first(),
  embed: {
    title: 'Tic Tac Toe',
    color: '#5865F2',
  },
  oEmoji: '🔵', 
  xEmoji: '❌',
  oColor: 'PRIMARY',
  xColor: 'DANGER',
  turnMessage: '{emoji} | Its now **{player}** turn!',
  waitMessage: 'Waiting for the opponent...',
  askMessage: 'Hey {opponent}, {challenger} challenged you for a game of Tic Tac Toe!',
  cancelMessage: 'Looks like they refused to have a game of Tic Tac Toe. \:(',
  timeEndMessage: 'Since the opponent didnt answer, i dropped the game!',
  drawMessage: 'It was a draw!',
  winMessage: '{emoji} | **{winner}** won the game!',
  gameEndMessage: 'The game went unfinished :(',
}).startGame();
```