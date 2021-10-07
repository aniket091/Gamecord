# 🧩 Guess The Pokemon

```js
const { GuessThePokemon } = require('discord-gamecord')

new GuessThePokemon({
  message: message,
  slash_command: false,
  embed: {
    title: 'Who\'s This Pokemon?',
    footer: 'You have only 1 chance',
    color: '#5865F2',
  },
  time: 60000,
  thinkMessage: '**Thinking...**',
  winMessage: 'Nice! The pokemon was **{pokemon}**',
  stopMessage: 'Better luck next time! It was a **{pokemon}**',
  incorrectMessage: 'Nope! The pokemon was **{pokemon}**',
}).startGame();
```