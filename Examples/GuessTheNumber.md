# **Guess the Number 🔢**

```js
const Discord = require('discord.js');
const client = new Discord.Client({
  intents: [Discord.GatewayIntentBits.Guilds, Discord.GatewayIntentBits.GuildMessages, Discord.GatewayIntentBits.MessageContent]
});
const { GuessTheNumber } = require('../index');

client.on('messageCreate', async (message) => {
  if(message.content === '!gtn') {
    const gtn = new GuessTheNumber({
      message: message,
      moreThanMessage: "The number you guessed is greater than the number we selected",
      lessThanMessage: "The number you guessed is less than the number we selected",
      winMessage: "Congratulations {player}! You guessed the corrent number",
      isSlashCommand: false, // set this to true if you are using slash commands
      range: {
        lowest: 1,
        highest: 100
      },
      idleEmbed: {
        title: "You are idling",
        description: "It looks like you are idling. Because of this, I have stopped the game",
        color: "Red",
        footer: "©️ Gamecord Development Team"
      },
      embed: {
        title: "Guess the number",
        description: "Guess the number between 1 and 100!",
        color: "Green",
        footer: "©️ Gamecord Development Team"
      },
      timeout: 60000, // in MS
      win: {
        embed: {
          title: "Congrats!",
          color: "Yellow"
        }
      },
      updateText: `The number you guessed is **{moreOrLess}** the number we chose. You have \`{tries}\` more tries`,
      deleteMessages: true
    })
    gtn.startGame()
    gtn.on("Gameover", async (state, reason) => {
      console.log(state, reason)
    })
  }
});

client.login('SUP3R_S3CR3T_T0K3N');
```