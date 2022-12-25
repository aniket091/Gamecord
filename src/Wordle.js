const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const words = require('../utils/words.json');
const events = require('events');


module.exports = class Wordle extends events {
  constructor(options = {}) {

    if (!options.isSlashGame) options.isSlashGame = false;
    if (!options.message) throw new TypeError('NO_MESSAGE: No message option was provided.');
    if (typeof options.message !== 'object') throw new TypeError('INVALID_MESSAGE: message option must be an object.');
    if (typeof options.isSlashGame !== 'boolean') throw new TypeError('INVALID_COMMAND_TYPE: isSlashGame option must be a boolean.');


    if (!options.embed) options.embed = {};
    if (!options.embed.title) options.embed.title = 'Wordle';
    if (!options.embed.color) options.embed.color = '#5865F2';

    if (!options.customWord) options.customWord = null;
    if (!options.timeoutTime) options.timeoutTime = 60000;
    if (!options.winMessage) options.winMessage = 'You won! The word was **{word}**.';
    if (!options.loseMessage) options.loseMessage = 'You lost! The word was **{word}**.';
    

    if (typeof options.embed !== 'object') throw new TypeError('INVALID_EMBED: embed option must be an object.');
    if (typeof options.embed.title !== 'string') throw new TypeError('INVALID_EMBED: embed title must be a string.');
    if (typeof options.embed.color !== 'string') throw new TypeError('INVALID_EMBED: embed color must be a string.');
    if (typeof options.timeoutTime !== 'number') throw new TypeError('INVALID_TIME: Timeout time option must be a number.');
    if (typeof options.winMessage !== 'string') throw new TypeError('INVALID_MESSAGE: Win message option must be a string.');
    if (typeof options.loseMessage !== 'string') throw new TypeError('INVALID_MESSAGE: Lose message option must be a string.');
    if (options.customWord && typeof options.customWord !== 'string') throw new TypeError('INVALID_WORD: Custom Word must be a string.');
    if (options.customWord && options.customWord.length !== 5) throw new RangeError('INVALID_WORD: Custom Word must be of 5 letters.');   

    super();
    this.options = options;
    this.message = options.message;
    this.word = options.customWord;
    this.guessed = [];
  }


  async sendMessage(content) {
    if (this.options.isSlashGame) return await this.message.editReply(content);
    else return await this.message.channel.send(content);
  }

  async getBoardImage() {
    const guess = this.guessed.length ? '&guessed='+this.guessed.join(',') : '';
    return await new AttachmentBuilder('https://api.aniket091.xyz/wordle?word=' + this.word + guess, { name: 'wordle.png' });
  }


  async startGame() {
    if (this.options.isSlashGame || !this.message.author) {
      if (!this.message.deferred) await this.message.deferReply().catch(e => {});
      this.message.author = this.message.user;
      this.options.isSlashGame = true;
    }
    if (!this.word) this.word = words['wordle'][Math.floor(Math.random() * words['wordle'].length)];


    const embed = new EmbedBuilder()
    .setColor(this.options.embed.color)
    .setTitle(this.options.embed.title)
    .setImage('attachment://wordle.png')
    .setFooter({ text: this.message.author.tag, iconURL: this.message.author.displayAvatarURL({ dynamic: true }) });

    const msg = await this.sendMessage({ embeds: [embed], files: [await this.getBoardImage()] });
    const filter = (m) => m.author.id === this.message.author.id && m.content.length === 5;
    const collector = this.message.channel.createMessageCollector({ idle: this.options.timeoutTime, filter: filter });


    collector.on('collect', async (m) => {
      const guess = m.content.toLowerCase();
      if (m.deletable) await m.delete().catch(e => {});

      this.guessed.push(guess);
      if (this.word === guess || this.guessed.length > 5) return collector.stop();
      await msg.edit({ embeds: [embed], files: [await this.getBoardImage()] });
    })


    collector.on('end', async (_, reason) => {
      if (reason === 'user' || reason === 'idle') return this.gameOver(msg);
    })
  }


  async gameOver(msg) {
    const WordleGame = { player: this.message.author, word: this.word, guessed: this.guessed };
    const GameOverMessage = this.guessed.includes(this.word) ? this.options.winMessage : this.options.loseMessage;
    this.emit('gameOver', { result: (this.guessed.includes(this.word) ? 'win' : 'lose'), ...WordleGame });


    const embed = new EmbedBuilder()
    .setColor(this.options.embed.color)
    .setTitle(this.options.embed.title)
    .setImage('attachment://wordle.png')
    .addFields({ name: 'Game Over', value: GameOverMessage.replace('{word}', this.word) })
    .setFooter({ text: this.message.author.tag, iconURL: this.message.author.displayAvatarURL() });

    return await msg.edit({ embeds: [embed], files: [await this.getBoardImage()] });
  }
}