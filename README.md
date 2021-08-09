# GAMECORD
<p align="center"><img align="center" style="width:0.5px" src="https://cdn.discordapp.com/attachments/818900078077018162/867985070210809936/banner.png"/></p><br/>
<p align="center">
   <img alt="npm" src="https://img.shields.io/npm/dt/discord-gamecord">
   <a href="https://discord.gg/invite/GaczkwfgV9"><img src="https://badgen.net/discord/online-members/GaczkwfgV9" alt="Discord"></a>
</p>
      
> **Discord Gamecord is a powerful module that allows you to play games within Discord :)**

## **⚙️ Installation** 
```js
npm i discord-gamecord
```
- For Discord.js v12: npm i discord-gamecord@old

## **✨ Features**

- Super simple and easy to use.
- Beginner friendly.
- Easy to Implement.
- Great support and flexible.

## **📚 Usage**
```js
const { Snake } = require('discord-gamecord')

new Snake({
  message: message,
  embed: {
    title: 'Snake Game',
    color: '#7289da',
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
}).startGame()
```


## **✏️ Example**
### **Looking for Examples? click here:** [**Examples!**](https://github.com/aniket091/Gamecord/tree/main/Examples)
```js
const Discord = require('discord.js');
const client = new Discord.Client();
const { Snake } = require('discord-gamecord');

client.on('message', async (message) => {
  if(message.content === '!snake') {
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
        down: '⬇️',
	right: '➡️',
	left: '⬅️',
      }
    }).startGame();
  }
});

client.login('DISCORD_BOT_TOKEN');
```

## **📷 Preview**
<img src="https://cdn.discordapp.com/attachments/818900078077018162/868061592871383060/example2.png">

## **❔ Support**
<a href="https://discord.gg/invite/GaczkwfgV9"><img src="https://invidget.switchblade.xyz/GaczkwfgV9" alt="Discord"></a>
