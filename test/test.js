const Discord = require('discord.js');
const client = new Discord.Client();
const { Snake } = require('../index');


client.on('message', async (message) => {
  if(message.content === '!snake') {
    new Snake({
      message: message,
      embed: {
        title: 'Snake Game',
	color: '#5865F2',
	OverTitle: "Game Over",
      },
      snake: { head: '😄', body: '🟨', tail: '🟡' },
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