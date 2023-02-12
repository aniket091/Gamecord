const { EmbedBuilder, ActionRowBuilder } = require('discord.js');
const { disableButtons, shuffleArray, formatMessage, buttonStyle, ButtonBuilder } = require('../utils/utils');
const events = require('events');


module.exports = class MatchPairs extends events {
  constructor(options = {}) {

    if (!options.isSlashGame) options.isSlashGame = false;
    if (!options.message) throw new TypeError('NO_MESSAGE: No message option was provided.');
    if (typeof options.message !== 'object') throw new TypeError('INVALID_MESSAGE: message option must be an object.');
    if (typeof options.isSlashGame !== 'boolean') throw new TypeError('INVALID_COMMAND_TYPE: isSlashGame option must be a boolean.');


    if (!options.embed) options.embed = {};
    if (!options.embed.title) options.embed.title = 'Match Pairs';
    if (!options.embed.color) options.embed.color = '#5865F2';
    if (!options.embed.description) options.embed.description = '**Click on the buttons to match emojis with their pairs.**';

    if (!options.timeoutTime) options.timeoutTime = 60000;
    if (!options.emojis) options.emojis = ['🍉', '🍇', '🍊', '🍋', '🥭', '🍎', '🍏', '🥝', '🥥', '🍓', '🍒', '🫐', '🍍', '🍅', '🍐', '🥔', '🌽', '🥕', '🥬', '🥦'];
    if (!options.winMessage) options.winMessage = '**You won the Game! You turned a total of `{tilesTurned}` tiles.**';
    if (!options.loseMessage) options.loseMessage = '**You lost the Game! You turned a total of `{tilesTurned}` tiles.**'; 
    

    if (typeof options.embed !== 'object') throw new TypeError('INVALID_EMBED: embed option must be an object.');
    if (typeof options.embed.title !== 'string') throw new TypeError('INVALID_EMBED: embed title must be a string.');
    if (typeof options.embed.color !== 'string') throw new TypeError('INVALID_EMBED: embed color must be a string.');
    if (typeof options.embed.description !== 'string') throw new TypeError('INVALID_EMBED: embed description must be a string.');
    if (typeof options.timeoutTime !== 'number') throw new TypeError('INVALID_TIME: Timeout time option must be a number.');
    if (typeof options.winMessage !== 'string') throw new TypeError('INVALID_MESSAGE: Win Message option must be a string.');
    if (typeof options.loseMessage !== 'string') throw new TypeError('INVALID_MESSAGE: Lose Message option must be a string.');
    if (!Array.isArray(options.emojis)) throw new TypeError('INVALID_EMOJIS: emojis option must be an array.');
    if (options.emojis.length < 12) throw new RangeError('INVALID_EMOJIS: Emojis option must contain at least 12 emojis.');
    if (options.playerOnlyMessage !== false) {
      if (!options.playerOnlyMessage) options.playerOnlyMessage = 'Only {player} can use these buttons.';
      if (typeof options.playerOnlyMessage !== 'string') throw new TypeError('INVALID_MESSAGE: playerOnly Message option must be a string.');
    }

    
    super();
    this.options = options;
    this.message = options.message;
    this.emojis = options.emojis;
    this.remainingPairs = 12;
    this.components = [];
    this.selected = null;
    this.tilesTurned = 0;
    this.length = 5;
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
    
    this.emojis = shuffleArray(this.emojis).slice(0, 12);
    this.emojis.push(...this.emojis, '🃏');
    this.emojis = shuffleArray(this.emojis);
    this.components = this.getComponents();


    const embed = new EmbedBuilder()
    .setColor(this.options.embed.color)
    .setTitle(this.options.embed.title)
    .setDescription(this.options.embed.description)
    .setAuthor({ name: this.message.author.tag, iconURL: this.message.author.displayAvatarURL({ dynamic: true }) });

    const msg = await this.sendMessage({ embeds: [embed], components: this.components });
    return this.handleButtons(msg);
  }


  getPairEmoji(emoji) {
    const emojis = [];
    for (let y = 0; y < this.length; y++) {
      for (let x = 0; x < this.length; x++) {
        const index = (y * this.length + x);
        if (this.emojis[index] === emoji) emojis.push({ x: x, y: y, id: index });
      }
    }
    return emojis;
  }


  getComponents() {
    const components = [];
    for (let y = 0; y < this.length; y++) {
      const row = new ActionRowBuilder();
      for (let x = 0; x < this.length; x++) {
        const btn = new ButtonBuilder().setStyle('SECONDARY').setLabel('\u200b').setCustomId('matchpairs_' + x + '_' + y);
        row.addComponents(btn);
      }
      components.push(row);
    }
    return components;
  }


  gameOver(msg, result) {
    const MatchPairsGame = { player: this.message.author, tilesTurned: this.tilesTurned, remainingPairs: this.remainingPairs };
    const GameOverMessage = result ? this.options.winMessage : this.options.loseMessage;
    this.emit('gameOver', { result: (result ? 'win' : 'lose'), ...MatchPairsGame });


    const embed = new EmbedBuilder()
    .setColor(this.options.embed.color)
    .setTitle(this.options.embed.title)
    .setDescription(GameOverMessage.replace('{tilesTurned}', this.tilesTurned))
    .setAuthor({ name: this.message.author.tag, iconURL: this.message.author.displayAvatarURL({ dynamic: true }) });

    return msg.edit({ embeds: [embed], components: disableButtons(this.components) });
  }


  async handleButtons(msg) {
    const collector = msg.createMessageComponentCollector({ idle: this.options.time });

    collector.on('collect', async btn => {
      await btn.deferUpdate().catch(e => {});
      if (btn.user.id !== this.message.author.id) {
        if (this.options.playerOnlyMessage) btn.followUp({ content: formatMessage(this.options, 'playerOnlyMessage'), ephemeral: true });
        return;
      }

      const x = parseInt(btn.customId.split('_')[1]);
      const y = parseInt(btn.customId.split('_')[2]);
      const id = (y * this.length + x);

      const emoji = this.emojis[id];
      const emojiBtn = this.components[y].components[x];
      this.tilesTurned += 1;

      
      if (!this.selected) {
        this.selected = { x: x, y: y, id: id };
        emojiBtn.setEmoji(emoji).setStyle('PRIMARY').removeLabel();
      }
      else if (this.selected.id === id) {
        this.selected = null;
        emojiBtn.removeEmoji().setStyle('SECONDARY').setLabel('\u200b');
      }
      else {
        const selectedEmoji = this.emojis[this.selected.id];
        const selectedBtn = this.components[this.selected.y].components[this.selected.x];
        const matched = (emoji === selectedEmoji || selectedEmoji === '🃏' || emoji === '🃏');


        if (selectedEmoji === '🃏' || emoji === '🃏') {
          const joker = (emoji === '🃏') ? this.selected : { x: x, y: y, id: id };
          const pair = this.getPairEmoji(this.emojis[joker.id]).filter(b => b.id !== joker.id)[0];
          const pairBtn = this.components[pair.y].components[pair.x];

          pairBtn.setEmoji(this.emojis[pair.id]).setStyle('SUCCESS').setDisabled(true).removeLabel();
        }


        emojiBtn.setEmoji(emoji).setStyle(matched ? 'SUCCESS' : 'DANGER').setDisabled(matched).removeLabel();
        selectedBtn.setEmoji(selectedEmoji).setStyle(matched ? 'SUCCESS' : 'DANGER').setDisabled(matched).removeLabel();

        if (!matched) {
          await msg.edit({ components: this.components });
          emojiBtn.removeEmoji().setStyle('SECONDARY').setLabel('\u200b');
          selectedBtn.removeEmoji().setStyle('SECONDARY').setLabel('\u200b');
          return this.selected = null;;
        }

        this.remainingPairs -= 1;
        this.selected = null;
      }


      if (this.remainingPairs === 0) return collector.stop();
      return await msg.edit({ components: this.components });
    })
    

    collector.on('end', async (_, reason) => {
      if (reason === 'idle') return this.gameOver(msg, false);
      if (reason === 'user') return this.gameOver(msg, true);
    })
  }
}