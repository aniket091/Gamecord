const Discord = require('discord.js');
const client = new Discord.Client();
const { Snake } = require('../index');


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