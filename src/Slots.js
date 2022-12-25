const { EmbedBuilder } = require('discord.js');
const events = require('events');


module.exports = class Slots extends events {
  constructor(options = {}) {

    if (!options.isSlashGame) options.isSlashGame = false;
    if (!options.message) throw new TypeError('NO_MESSAGE: No message option was provided.');
    if (typeof options.message !== 'object') throw new TypeError('INVALID_MESSAGE: message option must be an object.');
    if (typeof options.isSlashGame !== 'boolean') throw new TypeError('INVALID_COMMAND_TYPE: isSlashGame option must be a boolean.');


    if (!options.embed) options.embed = {};
    if (!options.embed.title) options.embed.title = 'Slot Machine';
    if (!options.embed.color) options.embed.color = '#5865F2';
    if (!options.slots) options.slots = ['🍇', '🍊', '🍋', '🍌'];


    if (typeof options.embed !== 'object') throw new TypeError('INVALID_EMBED: embed option must be an object.');
    if (typeof options.embed.title !== 'string') throw new TypeError('INVALID_EMBED: embed title must be a string.');
    if (typeof options.embed.color !== 'string') throw new TypeError('INVALID_EMBED: embed color must be a string.');
    if (!Array.isArray(options.slots)) throw new TypeError('INVALID_SLOTS: slots option must be an array.');

    super();
    this.options = options;
    this.message = options.message;
    this.slot1 = this.slot2 = this.slot3 = 0;
    this.slots = options.slots;
    this.result = null;
  }


  getBoardContent(showResult) {
    let board = '```\n-------------------\n';
    board += `${this.wrap(this.slot1, false)}  :  ${this.wrap(this.slot2, false)}  :  ${this.wrap(this.slot3, false)}\n\n`;
    board += `${this.slots[this.slot1]}  :  ${this.slots[this.slot2]}  :  ${this.slots[this.slot3]} <\n\n`;
    board += `${this.wrap(this.slot1, true)}  :  ${this.wrap(this.slot2, true)}  :  ${this.wrap(this.slot3, true)}\n`;
    board += '-------------------\n';

    if (showResult) board += `| : :   ${(this.hasWon() ? 'WON ' : 'LOST')}   : : |`;
    return (board + '```');
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
    this.slotMachine();


    const embed = new EmbedBuilder()
    .setColor(this.options.embed.color)
    .setTitle(this.options.embed.title)
    .setDescription(this.getBoardContent())
    .setFooter({ text: this.message.author.tag, iconURL: this.message.author.displayAvatarURL({ dynamic: true }) })
    const msg = await this.sendMessage({ embeds: [embed] });
    

    setTimeout(async () => {
      this.slotMachine();
      embed.setDescription(this.getBoardContent());
      
      this.slotMachine();
      await msg.edit({ embeds: [embed] });
      setTimeout(() => { this.gameOver(msg) }, 2000);
    }, 2000);
  }


  gameOver(msg) {
    const SlotsGame = { player: this.message.author, slots: [this.slot1, this.slot2, this.slot3].map(s => this.slots[s]) };
    this.emit('gameOver', { result: (this.hasWon() ? 'win':'lose'), ...SlotsGame });


    const embed = new EmbedBuilder()
    .setColor(this.options.embed.color)
    .setTitle(this.options.embed.title)
    .setDescription(this.getBoardContent(true))
    .setFooter({ text: this.message.author.tag, iconURL: this.message.author.displayAvatarURL({ dynamic: true }) })

    return msg.edit({ embeds: [embed] });
  }


  slotMachine() {
    this.slot1 = Math.floor(Math.random() * this.slots.length);
    this.slot2 = Math.floor(Math.random() * this.slots.length);
    this.slot3 = Math.floor(Math.random() * this.slots.length);
  }

  hasWon() {
    return (this.slot1 === this.slot2 && this.slot1 === this.slot3);
  }

  wrap(s, add) {
    if (add) return (s+1 > this.slots.length-1) ? this.slots[0] : this.slots[s+1];
    return (s-1 < 0) ? this.slots[this.slots.length-1] : this.slots[s-1];
  }
}