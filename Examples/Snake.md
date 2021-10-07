# 🐍 Snake Game

```js
const { Snake } = require('discord-gamecord')

new Snake({
  message: message,
  slash_command: false,
  embed: {
    title: 'Snake',
    color: '#5865F2',
    OverTitle: 'Game Over',
  },
  snake: { head: '🟢', body: '🟩', tail: '🟢', over: '💀' },
  emojis: {
    board: '⬛', 
    food: '🍎',
    up: '⬆️', 
    right: '➡️',
    down: '⬇️',
    left: '⬅️',
  },
  foods: ['🍎', '🍇', '🍊'],
  stopButton: 'Stop',
  othersMessage: 'You are not allowed to use buttons for this message!',
}).startGame();
```