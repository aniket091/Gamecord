const { EmbedBuilder } = require('discord.js');
const events = require('events');


module.exports = class FishyGame extends events {
  constructor(options = {}) {

    if (!options.isSlashGame) options.isSlashGame = false;
    if (!options.message) throw new TypeError('NO_MESSAGE: No message option was provided.');
    if (typeof options.message !== 'object') throw new TypeError('INVALID_MESSAGE: message option must be an object.');
    if (typeof options.isSlashGame !== 'boolean') throw new TypeError('INVALID_COMMAND_TYPE: isSlashGame option must be a boolean.');


    if (!options.embed) options.embed = {};
    if (!options.embed.title) options.embed.title = 'Fishy Inventory';
    if (!options.embed.color) options.embed.color = '#5865F2';

    if (!options.player) options.player = {};
    if (!options.player.id) options.player.id = options.message[options.isSlashGame ? 'user' : 'author'].id;
    if (!options.player.balance && options.player.balance !== 0) options.player.balance = 50;
    if (!options.player.fishes) options.player.fishes = {};

    if (!options.fishes) options.fishes = {};
    if (!options.fishes.junk) options.fishes.junk = { emoji: '🔧', price: 5 };
    if (!options.fishes.common) options.fishes.common = { emoji: '🐟', price: 10 };
    if (!options.fishes.uncommon) options.fishes.uncommon = { emoji: '🐠', price: 20 };
    if (!options.fishes.rare) options.fishes.rare = { emoji: '🐡', price: 50 };

    if (!options.fishyRodPrice) options.fishyRodPrice = 10;
    if (!options.catchMessage) options.catchMessage = 'You caught a {fish}. You paid {amount} for the fishing rod.';
    if (!options.sellMessage) options.sellMessage = 'You sold {amount}x {fish} {type} items for a total of {price}.';
    if (!options.noBalanceMessage) options.noBalanceMessage = 'You don\'t have enough balance to rent a fishing rod.';
    if (!options.invalidTypeMessage) options.invalidTypeMessage = 'Fish type can only be junk, common, uncommon or rare.';
    if (!options.invalidAmountMessage) options.invalidAmountMessage = 'Amount must be between 0 and fish max amount.';
    if (!options.noItemMessage) options.noItemMessage = 'You don\'t have any of this item in your inventory.';


    if (typeof options.embed !== 'object') throw new TypeError('INVALID_EMBED: embed option must be an object.');
    if (typeof options.embed.title !== 'string') throw new TypeError('INVALID_EMBED: embed title must be a string.');
    if (typeof options.embed.color !== 'string') throw new TypeError('INVALID_EMBED: embed color must be a string.');
    if (typeof options.player !== 'object') throw new TypeError('INVALID_PLAYER: player option must be an object.');
    if (typeof options.player.id !== 'string') throw new TypeError('INVALID_PLAYER: player id must be a string.');
    if (typeof options.player.fishes !== 'object') throw new TypeError('INVALID_PLAYER: player fishes must be an object.');
    if (typeof options.player.balance !== 'number') throw new TypeError('INVALID_PLAYER: player money must be a number.');
    if (typeof options.fishyRodPrice !== 'number') throw new TypeError('INVALID_PRICE: FishyRod Price must be a number.');
    if (typeof options.catchMessage !== 'string') throw new TypeError('INVALID_MESSAGE: Catch message option must be a string.');
    if (typeof options.sellMessage !== 'string') throw new TypeError('INVALID_MESSAGE: Sell message option must be a string.');
    if (typeof options.noBalanceMessage !== 'string') throw new TypeError('INVALID_MESSAGE: noBalance message option must be a string.');
    if (typeof options.invalidTypeMessage !== 'string') throw new TypeError('INVALID_MESSAGE: InvalidType message option must be a string.');
    if (typeof options.invalidAmountMessage !== 'string') throw new TypeError('INVALID_MESSAGE: InvalidAmount message option must be a string.');
    if (typeof options.noItemMessage !== 'string') throw new TypeError('INVALID_MESSAGE: noItem message option must be a string.');
    if (!options.message.deferred) options.message.deferReply().catch(e => {});

    super();
    this.options = options;
    this.message = options.message;
    this.player = options.player;
    this.fishes = options.fishes;
  }


  async sendMessage(content) {  
    if (this.options.isSlashGame) {
      if (!this.message.deferred) return await this.message.reply(content);
      else return await this.message.editReply(content);
    }
    else return await this.message.channel.send(content);
  }


  async catchFish() {
    let fishType = 'rare';
    const fishId = Math.floor(Math.random() * 10) + 1;

    if (fishId < 5) fishType = 'junk';
    else if (fishId < 8) fishType = 'common';
    else if (fishId < 10) fishType = 'uncommon';


    const fish = this.fishes[fishType];
    if (this.player.balance < this.options.fishyRodPrice) return this.sendMessage({ content: this.options.noBalanceMessage });
    const content = this.options.catchMessage.replace('{fish}', fish.emoji).replace('{amount}', this.options.fishyRodPrice);


    this.player.balance -= this.options.fishyRodPrice;
    this.player.fishes[fishType] = (this.player.fishes[fishType] || 0) + 1;

    this.emit('catchFish', { player: this.player, fishType: fishType, fish: fish });
    return await this.sendMessage({ content: content });
  }


  async sellFish(type, amount) {
    if (!this.fishes[type]) return this.sendMessage({ content: this.options.invalidTypeMessage });
    if (!this.player.fishes[type]) return this.sendMessage({ content: this.options.noItemMessage });
    if (parseInt(amount) < 0 || parseInt(amount) > this.player.fishes[type]) return this.sendMessage({ content: this.options.invalidAmountMessage });


    const fish = this.fishes[type];
    const content = this.options.sellMessage.replace('{amount}', amount).replace('{type}', type).replace('{fish}', fish.emoji).replace('{price}', (fish.price * amount));

    this.player.fishes[type] -= amount;
    this.player.balance += (fish.price * amount);

    this.emit('sellFish', { player: this.player, fishType: type, fish: fish });
    return await this.sendMessage({ content: content });
  }


  async fishyInventory() {
    const fishes = (['Common', 'Uncommon', 'Rare'].map(e => `**\u2000${this.fishes[e.toLowerCase()].emoji} ${e} Fish** — ${this.player.fishes[e.toLowerCase()] || 0}`).join('\n\n'));

    const embed = new EmbedBuilder()
    .setColor(this.options.embed.color)
    .setTitle(this.options.embed.title)
    .setAuthor({ name: this.message.author.tag, iconURL: this.message.author.displayAvatarURL({ dynamic: true }) })
    .setDescription(fishes + `\n\n\u2000**${this.fishes.junk.emoji} Junk** — ${this.player.fishes.junk || 0}`)
    .setTimestamp()

    return await this.sendMessage({ embeds: [embed] });
  }
}