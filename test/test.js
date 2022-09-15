const Discord = require('discord.js');
const client = new Discord.Client({
  intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MESSAGES]
});
const { Calculator } = require('../index');

client.on('messageCreate', async (message) => {
  if(message.content === '!cal') {
    const cal = new Calculator({
      isSlashCommand: false,
      message: message,
      embed: {
        footer: "Calculator",
        title: '©️ Gamecord',
        color: "GREEN"
      },
      otherMessage: "This is not your game {author}"
    })
    cal.startGame()
  }
});

client.login('Token');