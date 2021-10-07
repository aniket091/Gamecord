# GAMECORD

<p align="center">
  <img src="https://cdn.discordapp.com/attachments/818900078077018162/893566634743173170/banner.png" alt="gamecord" />
</p>

</br>

<p align="center">
  <a href="https://www.npmjs.com/package/discord-gamecord">
    <img src="https://img.shields.io/npm/dt/discord-gamecord?style=for-the-badge" alt="npm" />
  </a>

  <a href="https://discord.gg/invite/GaczkwfgV9">
    <img src="https://img.shields.io/discord/800631529351938089?color=5865F2&label=Aniket&style=for-the-badge" alt="Discord Server" />
  </a>
</p>

> **Discord Gamecord is a powerful module that allows you to play games within Discord :)**

## **⚙️ Installation** 
```
npm i discord-gamecord
```


## **✨ Features**

- Super simple and easy to use.
- Beginner friendly.
- Easy to Implement.
- Supports Slash Commands.

## **📚 Usage**
```js
const { Snake } = require('discord-gamecord')

new Snake({
  message: message,
  slash_command: false,
  embed: {
    title: 'Snake Game',
    color: '#5865F2',
    overTitle: 'Game Over',
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
}).startGame()
```


## **✏️ Example**
### **Looking for Examples? click here:** [**Examples!**](https://discord-gamecord.js.org/docs/gamecord/master/general/welcome)
```js
const Discord = require('discord.js');
const client = new Discord.Client();
const { Snake } = require('discord-gamecord');


client.on('messageCreate', async (message) => {
  if(message.content === '!snake') {
    new Snake({
      message: message,
      slash_command: false,
      embed: {
        title: 'Snake Game',
        color: '#5865F2',
        OverTitle: 'Game Over',
      },
      snake: { head: '🟢', body: '🟩', tail: '🟢' },
      emojis: {
        board: '⬛',
        food: '🍎',
        up: '⬆️', 
        down: '⬇️',
        right: '➡️',
        left: '⬅️',
      }
    }).startGame();
  }
});

client.login('YOUR_COOL_DISCORD_BOT_TOKEN');
```

## **Docs**
For more information about the Games and how to use them, refer the [Docs!](https://discord-gamecord.js.org/)

## **📷 Preview**
<img src="https://cdn.discordapp.com/attachments/818900078077018162/894099405051932712/example.png">

## **❔ Support**
<a href="https://discord.gg/invite/GaczkwfgV9"><img src="https://invidget.switchblade.xyz/GaczkwfgV9" alt="Discord"></a>
