const { EmbedBuilder, ActionRowBuilder } = require('discord.js');
const { disableButtons, shuffleArray, formatMessage, ButtonBuilder } = require('../utils/utils');
const events = require('events');


module.exports = class FindEmoji extends events {  
  constructor(options = {}) {

    if (!options.isSlashGame) options.isSlashGame = false;
    if (!options.message) throw new TypeError('NO_MESSAGE: No message option was provided.');
    if (typeof options.message !== 'object') throw new TypeError('INVALID_MESSAGE: message option must be an object.');
    if (typeof options.isSlashGame !== 'boolean') throw new TypeError('INVALID_COMMAND_TYPE: isSlashGame option must be a boolean.');


    if (!options.embed) options.embed = {};
    if (!options.embed.title) options.embed.title = 'Find Emoji';
    if (!options.embed.color) options.embed.color = '#5865F2';
    if (!options.embed.description) options.embed.description = 'Remember the emojis from the board below.'
    if (!options.embed.findDescription) options.embed.findDescription = 'Find the {emoji} emoji before the time runs out.';

    if (!options.timeoutTime) options.timeoutTime = 60000;
    if (!options.hideEmojiTime) options.hideEmojiTime = 5000;
    if (!options.buttonStyle) options.buttonStyle = 'PRIMARY';
    if (!options.emojis) options.emojis = ['🍉', '🍇', '🍊', '🍋', '🥭', '🍎', '🍏', '🥝', '🥥', '🍓', '🍒'];

    if (!options.winMessage) options.winMessage = 'You won! You selected the correct emoji. {emoji}';
    if (!options.loseMessage) options.loseMessage = 'You lost! You selected the wrong emoji. {emoji}';
    if (!options.timeoutMessage) options.timeoutMessage = 'You lost! You ran out of time. The emoji is {emoji}';


    if (typeof options.embed !== 'object') throw new TypeError('INVALID_EMBED: embed option must be an object.');
    if (typeof options.embed.title !== 'string') throw new TypeError('INVALID_EMBED: embed title must be a string.');
    if (typeof options.embed.color !== 'string') throw new TypeError('INVALID_EMBED: embed color must be a string.');
    if (typeof options.embed.description !== 'string') throw new TypeError('INVALID_EMBED: embed description must be a string.');
    if (typeof options.embed.findDescription !== 'string') throw new TypeError('INVALID_EMBED: embed findDescription must be a string.');
    if (typeof options.timeoutTime !== 'number') throw new TypeError('INVALID_TIME: Timeout time option must be a number.');
    if (typeof options.hideEmojiTime !== 'number') throw new TypeError('INVALID_TIME: HideEmoji time option must be a number.');
    if (typeof options.buttonStyle !== 'string') throw new TypeError('INVALID_BUTTON_STYLE: button style must be a string.');
    if (!Array.isArray(options.emojis)) throw new TypeError('INVALID_EMOJIS: emojis option must be an array.');
    if (typeof options.winMessage !== 'string') throw new TypeError('INVALID_MESSAGE: Win message option must be a string.');
    if (typeof options.loseMessage !== 'string') throw new TypeError('INVALID_MESSAGE: Lose message option must be a string.');
    if (typeof options.timeoutMessage !== 'string') throw new TypeError('INVALID_MESSAGE: Timeout message option must be a string.');
    if (options.playerOnlyMessage !== false) {
      if (!options.playerOnlyMessage) options.playerOnlyMessage = 'Only {player} can use these buttons.';
      if (typeof options.playerOnlyMessage !== 'string') throw new TypeError('INVALID_MESSAGE: playerOnly Message option must be a string.');
    }


    super();
    this.options = options;
    this.message = options.message;
    this.emojis = options.emojis;
    this.selected = null;
    this.emoji = null;
  }


  async sendMessage(content) {
    if (this.options.isSlashGame) return await this.message.editReply(content);
    else return await this.message.channel.send(content);
  }


  async startGame() {
    if (this.options.isSlashGame || !this.message.author) {
      if (!this.message.deferred) await this.message.deferReply().catch(e => {});
      this.message.author = this.message.user;
      this.options.isSlashGame = true;
    }

    this.emojis = shuffleArray(this.emojis).slice(0, 8);
    this.emoji = this.emojis[Math.floor(Math.random() * this.emojis.length)];


    const embed = new EmbedBuilder()
    .setColor(this.options.embed.color)
    .setTitle(this.options.embed.title)
    .setDescription(this.options.embed.description)
    .setFooter({ text: this.message.author.tag, iconURL: this.message.author.displayAvatarURL({ dynamic: true }) });
    const msg = await this.sendMessage({ embeds: [embed], components: this.getComponents(true) });


    setTimeout(async () => {
      embed.setDescription(this.options.embed.findDescription.replace('{emoji}', this.emoji));
      await msg.edit({ embeds: [embed], components: this.getComponents(false) });
      const collector = msg.createMessageComponentCollector({ idle: this.options.timeoutTime });


      collector.on('collect', async (btn) => {
        await btn.deferUpdate().catch(e => {});
        if (btn.user.id !== this.message.author.id) {
          if (this.options.playerOnlyMessage) btn.followUp({ content: formatMessage(this.options, 'playerOnlyMessage'), ephemeral: true });
          return;
        }
        this.selected = this.emojis[parseInt(btn.customId.split('_')[1])];
        return collector.stop();
      })


      collector.on('end', async (_, reason) => {
        if (reason === 'idle' || reason === 'user') return this.gameOver(msg, (reason === 'user'));
      })
    }, this.options.hideEmojiTime);
  }


  gameOver(msg, result) {
    const FindEmojiGame = { player: this.message.author, selectedEmoji: this.selected, correctEmoji: this.emoji };
    const resultMessage = result ? ((this.selected === this.emoji) ? 'win' : 'lose') : 'timeout';
    this.emit('gameOver', { result: resultMessage, ...FindEmojiGame });
    if (!result) this.selected = this.emoji;


    const embed = new EmbedBuilder()
    .setColor(this.options.embed.color)
    .setTitle(this.options.embed.title)
    .setDescription(this.options[resultMessage+'Message'].replace('{emoji}', this.emoji))
    .setFooter({ text: this.message.author.tag, iconURL: this.message.author.displayAvatarURL({ dynamic: true }) })

    return msg.edit({ embeds: [embed], components: disableButtons(this.getComponents(true)) });
  }


  getComponents(showEmoji) {
    const components = [];
    for (let x = 0; x < 2; x++) {
      const row = new ActionRowBuilder();
      for (let y = 0; y < 4; y++) {
        const buttonEmoji = this.emojis[x * 4 + y];

        const btn = new ButtonBuilder().setCustomId('findEmoji_' + (x*4 + y))
        .setStyle(buttonEmoji === this.selected ? (this.selected === this.emoji ? 'SUCCESS' : 'DANGER') : this.options.buttonStyle);
        if (showEmoji) btn.setEmoji(buttonEmoji);
        else btn.setLabel('\u200b');
        row.addComponents(btn);
      }
      components.push(row);
    }
    return components;
  }
}