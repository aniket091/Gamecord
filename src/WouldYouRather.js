const { EmbedBuilder, ActionRowBuilder } = require('discord.js');
const { formatMessage, ButtonBuilder } = require('../utils/utils');
const fetch = require('node-fetch');
const events = require('events');


module.exports = class WouldYouRather extends events {
  constructor(options = {}) {

    if (!options.isSlashGame) options.isSlashGame = false;
    if (!options.message) throw new TypeError('NO_MESSAGE: No message option was provided.');
    if (typeof options.message !== 'object') throw new TypeError('INVALID_MESSAGE: message option must be an object.');
    if (typeof options.isSlashGame !== 'boolean') throw new TypeError('INVALID_COMMAND_TYPE: isSlashGame option must be a boolean.');


    if (!options.embed) options.embed = {};
    if (!options.embed.title) options.embed.title = 'Would You Rather';
    if (!options.embed.color) options.embed.color = '#5865F2';

    if (!options.buttons) options.buttons = {};
    if (!options.buttons.option1) options.buttons.option1 = 'Option 1';
    if (!options.buttons.option2) options.buttons.option2 = 'Option 2';
    if (!options.errMessage) options.errMessage = 'Unable to fetch question data! Please try again.';
    if (!options.buttonStyle) options.buttonStyle = 'PRIMARY';


    if (typeof options.embed !== 'object') throw new TypeError('INVALID_EMBED: embed option must be an object.');
    if (typeof options.embed.title !== 'string') throw new TypeError('INVALID_EMBED: embed title must be a string.');
    if (typeof options.embed.color !== 'string') throw new TypeError('INVALID_EMBED: embed color must be a string.');
    if (typeof options.buttons !== 'object') throw new TypeError('INVALID_BUTTON: buttons option must be an object.');
    if (typeof options.buttons.option1 !== 'string') throw new TypeError('INVALID_BUTTON: option1 button must be a string.');
    if (typeof options.buttons.option2 !== 'string') throw new TypeError('INVALID_BUTTON: option2 button must be a string.');
    if (typeof options.buttonStyle !== 'string') throw new TypeError('INVALID_BUTTON_STYLE: button style must be a string.');
    if (typeof options.errMessage !== 'string') throw new TypeError('INVALID_MESSAGE: Error message option must be a string.');
    if (options.playerOnlyMessage !== false) {
      if (!options.playerOnlyMessage) options.playerOnlyMessage = 'Only {player} can use these buttons.';
      if (typeof options.playerOnlyMessage !== 'string') throw new TypeError('INVALID_MESSAGE: playerOnly Message option must be a string.');
    }

    super();
    this.options = options;
    this.message = options.message;
    this.data = null;
  }


  async sendMessage(content) {
    if (this.options.isSlashGame) return await this.message.editReply(content);
    else return await this.message.channel.send(content);
  }

  async getWyrQuestion() {
    return await fetch('https://api.aniket091.xyz/wyr').then(res => res.json()).then(res => res?.data).catch(e => { return {} });
  }


  async startGame() {
    if (this.options.isSlashGame || !this.message.author) {
      if (!this.message.deferred) await this.message.deferReply().catch(e => {});
      this.message.author = this.message.user;
      this.options.isSlashGame = true;
    }

    this.data = await this.getWyrQuestion();
    if (!this.data.title) return this.sendMessage({ content: this.options.errMessage });


    const embed = new EmbedBuilder()
    .setColor(this.options.embed.color)
    .setTitle(this.options.embed.title)
    .setDescription(`1. ${this.data.option1} \n2. ${this.data.option2}`)
    .setAuthor({ name: this.message.author.tag, iconURL: this.message.author.displayAvatarURL({ dynamic: true }) })
    .addFields({ name: 'Details', value: `**Title:** ${this.data.title}\n**Author:** ${this.data.author}` })


    const btn1 = new ButtonBuilder().setStyle(this.options.buttonStyle).setLabel(this.options.buttons.option1).setCustomId('wyr_1').setEmoji('1️⃣');
    const btn2 = new ButtonBuilder().setStyle(this.options.buttonStyle).setLabel(this.options.buttons.option2).setCustomId('wyr_2').setEmoji('2️⃣');
    const row = new ActionRowBuilder().addComponents(btn1, btn2);

    const msg = await this.sendMessage({ embeds: [embed], components: [row] });
    const collector = msg.createMessageComponentCollector({ });


    collector.on('collect', async btn => {
      await btn.deferUpdate().catch(e => {});
      if (btn.user.id !== this.message.author.id) {
        if (this.options.playerOnlyMessage) btn.followUp({ content: formatMessage(this.options, 'playerOnlyMessage'), ephemeral: true });
        return;
      }

      collector.stop();
      return this.gameOver(msg, btn.customId.split('_')[1]);
    })
  }


  async gameOver(msg, result) {
    const WouldYouRatherGame = { player: this.message.author, question: this.data, selected: this.data['option'+result] };
    this.emit('gameOver', { result: 'finish', ...WouldYouRatherGame });

    const prnt1 = Math.floor(parseInt(this.data.option1_votes) / (parseInt(this.data.option1_votes) + parseInt(this.data.option2_votes)) * 100);
    const prnt2 = Math.floor(parseInt(this.data.option2_votes) / (parseInt(this.data.option1_votes) + parseInt(this.data.option2_votes)) * 100);


    const embed = new EmbedBuilder()
    .setColor(this.options.embed.color)
    .setTitle(this.options.embed.title)
    .setAuthor({ name: this.message.author.tag, iconURL: this.message.author.displayAvatarURL({ dynamic: true }) })
    .addFields({ name: 'Details', value: `**Title:** ${this.data.title}\n**Author:** ${this.data.author}` })

    if (result === '1') embed.setDescription(`**1. ${this.data.option1} (${prnt1}%)**\n2. ${this.data.option2} (${prnt2})%`);
    else embed.setDescription(`1. ${this.data.option1} (${prnt1}%)\n**2. ${this.data.option2} (${prnt2})%**`);
    
    return await msg.edit({ embeds: [embed], components: [] });    
  }
}