const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const fetch = require('node-fetch');
const events = require('events');


module.exports = class GuessThePokemon extends events {
  constructor(options = {}) {

    if (!options.isSlashGame) options.isSlashGame = false;
    if (!options.message) throw new TypeError('NO_MESSAGE: No message option was provided.');
    if (typeof options.message !== 'object') throw new TypeError('INVALID_MESSAGE: message option must be an object.');
    if (typeof options.isSlashGame !== 'boolean') throw new TypeError('INVALID_COMMAND_TYPE: isSlashGame option must be a boolean.');


    if (!options.embed) options.embed = {};
    if (!options.embed.title) options.embed.title = 'Who\'s The Pokemon';
    if (!options.embed.color) options.embed.color = '#5865F2';

    if (!options.timeoutTime) options.timeoutTime = 60000;
    if (!options.winMessage) options.winMessage = 'You guessed it right! It was a {pokemon}.';
    if (!options.loseMessage) options.loseMessage = 'Better luck next time! It was a {pokemon}.';
    if (!options.errMessage) options.errMessage = 'Unable to fetch pokemon data! Please try again.';


    if (typeof options.embed !== 'object') throw new TypeError('INVALID_EMBED: embed option must be an object.');
    if (typeof options.embed.title !== 'string') throw new TypeError('INVALID_EMBED: embed title must be a string.');
    if (typeof options.embed.color !== 'string') throw new TypeError('INVALID_EMBED: embed color must be a string.');
    if (typeof options.timeoutTime !== 'number') throw new TypeError('INVALID_TIME: Timeout time option must be a number.');
    if (typeof options.winMessage !== 'string') throw new TypeError('INVALID_MESSAGE: Win Message option must be a string.');
    if (typeof options.loseMessage !== 'string') throw new TypeError('INVALID_MESSAGE: Lose Message option must be a string.');

    super();
    this.options = options;
    this.message = options.message;
    this.pokemon = {};
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

    const result = await fetch('https://api.aniket091.xyz/pokemon').then(res => res.json()).catch(e => { return {} });
    if (!result.data) return this.sendMessage({ content: this.options.errMessage });
    this.pokemon = result.data;


    const embed = new EmbedBuilder()
    .setColor(this.options.embed.color)
    .setTitle(this.options.embed.title)
    .setImage('attachment://question-image.png')
    .addFields({ name: 'Types', value: this.pokemon.types.join(', ') ?? 'No Data', inline: true })
    .addFields({ name: 'Abilities', value: this.pokemon.abilities.join(', ') ?? 'No Data', inline: true })
    .setAuthor({ name: this.message.author.tag, iconURL: this.message.author.displayAvatarURL({ dynamic: true }) });


    const attachment = new AttachmentBuilder(this.pokemon.questionImage, { name: 'question-image.png' });
    const msg = await this.sendMessage({ embeds: [embed], files: [attachment] });

    const filter = (m) => m.author.id === this.message.author.id;
    const collector = this.message.channel.createMessageCollector({ idle: this.options.timeoutTime, filter: filter });


    collector.on('collect', (m) => {
      collector.stop();
      return this.gameOver(msg, m.content?.toLowerCase() === this.pokemon.name.toLowerCase());
    })

    collector.on('end', (_, reason) => {
      if (reason === 'idle') return this.gameOver(msg, false);
    })
  }


  async gameOver(msg, result) {
    const GuessThePokemonGame = { player: this.message.author, pokemon: this.pokemon };
    this.emit('gameOver', { result: result ? 'win' : 'lose', ...GuessThePokemonGame });
    if (!result) return msg.edit({ content: this.options.loseMessage.replace('{pokemon}', this.pokemon.name), embeds: [], attachments: [] });


    const embed = new EmbedBuilder()
    .setColor(this.options.embed.color)
    .setTitle(this.options.embed.title)
    .setImage('attachment://answer-image.png')
    .addFields({ name: 'Types', value: this.pokemon.types.join(', ') ?? 'No Data', inline: true })
    .addFields({ name: 'Abilities', value: this.pokemon.abilities.join(', ') ?? 'No Data', inline: true })
    .setAuthor({ name: this.message.author.tag, iconURL: this.message.author.displayAvatarURL({ dynamic: true }) });

    const attachment = new AttachmentBuilder(this.pokemon.answerImage, { name: 'answer-image.png' });
    return msg.edit({ content: this.options.winMessage.replace('{pokemon}', this.pokemon.name), embeds: [embed], files: [attachment] });
  }
}