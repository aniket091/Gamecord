const { MessageEmbed, MessageButton, MessageActionRow } = require('discord.js');
const { formatMessage } = require('./utils');
const events = require('events');


module.exports = class Approve extends events {
  constructor(options = {}) {

    if (!options.embed) options.embed = {};
    if (!options.embed.requestTitle) options.embed.requestTitle = options.embed.title;
    if (!options.embed.requestColor) options.embed.requestColor = options.embed.color;
    if (!options.embed.rejectTitle) options.embed.rejectTitle = options.embed.title;
    if (!options.embed.rejectColor) options.embed.rejectColor = options.embed.color;

    if (!options.buttons) options.buttons = {};
    if (!options.buttons.accept) options.buttons.accept = 'Accept';
    if (!options.buttons.reject) options.buttons.reject = 'Reject';

    if (!options.reqTimeoutTime) options.reqTimeoutTime = 30000;
    if (!options.requestMessage) options.requestMessage = '{player} has invited you for a round of Game.';
    if (!options.rejectMessage) options.rejectMessage = 'The player denied your request for a round of Game.';
    if (!options.reqTimeoutMessage) options.reqTimeoutMessage = 'Dropped the game as the player did not respond.';

    super();
    this.options = options;
    this.message = options.message;
    this.opponent = options.opponent;
  }

  
  async sendMessage(content) {
    if (this.options.isSlashGame) return await this.message.editReply(content);
    else return await this.message.channel.send(content);
  }


  async approve() {
    return new Promise(async resolve => {

      const embed = new MessageEmbed()
      .setColor(this.options.embed.requestColor)
      .setTitle(this.options.embed.requestTitle)
      .setDescription(formatMessage(this.options, 'requestMessage'));

      const btn1 = new MessageButton().setLabel(this.options.buttons.accept).setCustomId('approve_accept').setStyle('SUCCESS');
      const btn2 = new MessageButton().setLabel(this.options.buttons.reject).setCustomId('approve_reject').setStyle('DANGER');
      const row = new MessageActionRow().addComponents(btn1, btn2);

      const msg = await this.sendMessage({ embeds: [embed], components: [row] });
      const collector = msg.createMessageComponentCollector({ time: this.options.reqTimeoutTime });


      collector.on('collect', async btn => {
        await btn.deferUpdate().catch(e => {});
        if (btn.user.id === this.opponent.id) collector.stop(btn.customId.split('_')[1]);
      })

      collector.on('end', async (_, reason) => {
        if (reason === 'accept') return resolve(msg);

        const embed = new MessageEmbed()
        .setColor(this.options.embed.rejectColor)
        .setTitle(this.options.embed.rejectTitle)
        .setDescription(formatMessage(this.options, 'rejectMessage'))

        if (reason === 'time') embed.setDescription(formatMessage(this.options, 'reqTimeoutMessage'));
        this.emit('gameOver', { result: reason, player: this.message.author, opponent: this.opponent });
        await msg.edit({ content: null, embeds: [embed], components: [] });
        return resolve(false);
      })
    })
  }
}

