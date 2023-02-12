# **GAMECORD**

<p align="center">
  <img src="https://cdn.discordapp.com/attachments/818900078077018162/1042159279597166682/banner.png" alt="gamecord" />
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/discord-gamecord">
    <img src="https://img.shields.io/npm/dt/discord-gamecord?style=for-the-badge" alt="npm" />
  </a>

  <a href="https://discord.gg/invite/GaczkwfgV9">
    <img src="https://img.shields.io/discord/800631529351938089?color=5865F2&label=Aniket&style=for-the-badge" alt="Discord Server" />
  </a>
</p>

> **Discord Gamecord is a powerful npm package with a collection of minigames for your discord bot :)**


## **⚙️ Installation** 
**For discord.js v13 use `npm i discord-gamecord@v3-lts`**
```
npm i discord-gamecord@latest
```


## **✨ Features**

- Easy to use.
- Beginner friendly.
- Slash Commands Games.
- Supports Discord.js v13 & v14.


## **📚 Usage**
```js
const { Snake } = require('discord-gamecord');

const Game = new Snake({
  message: message,
  isSlashGame: false,
  embed: {
    title: 'Snake Game',
    overTitle: 'Game Over',
    color: '#5865F2'
  },
  emojis: {
    board: '⬛',
    food: '🍎',
    up: '⬆️', 
    down: '⬇️',
    left: '⬅️',
    right: '➡️',
  },
  stopButton: 'Stop',
  timeoutTime: 60000,
  snake: { head: '🟢', body: '🟩', tail: '🟢', over: '💀' },
  foods: ['🍎', '🍇', '🍊', '🫐', '🥕', '🥝', '🌽'],
  playerOnlyMessage: 'Only {player} can use these buttons.'
});

Game.startGame();
Game.on('gameOver', result => {
  console.log(result);  // =>  { result... }
});
```


## **📷 Preview**
<img src="https://cdn.discordapp.com/attachments/818900078077018162/1042159356780757072/Preview.png">

## **❔ Support**
<a href="https://discord.gg/invite/GaczkwfgV9"><img src="https://invidget.switchblade.xyz/GaczkwfgV9" alt="Discord"></a>

