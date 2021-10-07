# 🐟 Fishy

```js
const { Fishy } = require('discord-gamecord')

new Fishy({
  message: message,
  fishyMessage: 'You caught a {fish}. I bet it\'d sell for around ${worth}.',
  returnMessage: false
}).startGame();
```