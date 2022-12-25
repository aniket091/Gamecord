const Discord = require('discord.js');
const client = new Discord.Client({ intents: [ 1, 512, 4096, 32768 ] });
const { Snake } = require('../index');


client.on('messageCreate', async (message) => {
  if(message.content === '!snake') {
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
      console.log(result);
    });
  }
});

client.login('DISCORD_BOT_TOKEN');