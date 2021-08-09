# 🐍 Snake

```js
const { Snake } = require('discord-gamecord')

new Snake({
    message: message,
    embed: {
    title: 'Snake Game',
    color: '#5865F2',
    OverTitle: "Game Over",
    },
    snake: { head: '🟢', body: '🟩', tail: '🟢' },
    emojis: {
      board: '⬛', 
      food: '🍎',
      up: '⬆️', 
      right: '➡️',
      down: '⬇️',
      left: '⬅️',
    },
    othersMessage: 'You are not allowed to use buttons for this message!',
}).startGame();
```