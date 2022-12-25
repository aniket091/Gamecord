const { EmbedBuilder, ActionRowBuilder } = require('discord.js');
const { getAlphaEmoji, formatMessage, ButtonBuilder } = require('../utils/utils');
const words = require('../utils/words.json');
const events = require('events');


module.exports = class Hangman extends events {
  constructor(options = {}) {

    if (!options.isSlashGame) options.isSlashGame = false;
    if (!options.message) throw new TypeError('NO_MESSAGE: No message option was provided.');
    if (typeof options.message !== 'object') throw new TypeError('INVALID_MESSAGE: message option must be an object.');
    if (typeof options.isSlashGame !== 'boolean') throw new TypeError('INVALID_COMMAND_TYPE: isSlashGame option must be a boolean.');


    if (!options.embed) options.embed = {};
    if (!options.embed.title) options.embed.title = 'Hangman';
    if (!options.embed.color) options.embed.color = '#5865F2';

    if (!options.hangman) options.hangman = {};
    if (!options.hangman.hat) options.hangman.hat = '🎩';
    if (!options.hangman.head) options.hangman.head = '😟';
    if (!options.hangman.shirt) options.hangman.shirt = '👕';
    if (!options.hangman.pants) options.hangman.pants = '🩳';
    if (!options.hangman.boots) options.hangman.boots = '👞👞';

    if (!options.customWord) options.customWord = null;
    if (!options.timeoutTime) options.timeoutTime = 60000;
    if (!options.theme) options.theme = Object.keys(words)[Math.floor(Math.random() * Object.keys(words).length)];
    if (!options.winMessage) options.winMessage = 'You won! The word was **{word}**.';
    if (!options.loseMessage) options.loseMessage = 'You lost! The word was **{word}**.';


    if (typeof options.embed !== 'object') throw new TypeError('INVALID_EMBED: embed option must be an object.');
    if (typeof options.embed.title !== 'string') throw new TypeError('INVALID_EMBED: embed title must be a string.');
    if (typeof options.embed.color !== 'string') throw new TypeError('INVALID_EMBED: embed color must be a string.');
    if (typeof options.hangman !== 'object') throw new TypeError('INVALID_HANGMAN: hangman option must be an object.');
    if (typeof options.hangman.hat !== 'string') throw new TypeError('INVALID_HANGMAN: hangman hat must be a string.');
    if (typeof options.hangman.head !== 'string') throw new TypeError('INVALID_HANGMAN: hangman head must be a string.');
    if (typeof options.hangman.shirt !== 'string') throw new TypeError('INVALID_HANGMAN: hangman shirt must be a string.');
    if (typeof options.hangman.pants !== 'string') throw new TypeError('INVALID_HANGMAN: hangman pants must be a string.');
    if (typeof options.hangman.boots !== 'string') throw new TypeError('INVALID_HANGMAN: hangman boots must be a string.');
    if (typeof options.timeoutTime !== 'number') throw new TypeError('INVALID_TIME: Timeout time option must be a number.');
    if (typeof options.winMessage !== 'string') throw new TypeError('INVALID_MESSAGE: Win Message option must be a string.');
    if (typeof options.loseMessage !== 'string') throw new TypeError('INVALID_MESSAGE: Lose Message option must be a string.');
    if (typeof options.theme !== 'string') throw new TypeError('INVALID_THEME: theme option must be a string.');
    if (options.playerOnlyMessage !== false) {
      if (!options.playerOnlyMessage) options.playerOnlyMessage = 'Only {player} can use these buttons.';
      if (typeof options.playerOnlyMessage !== 'string') throw new TypeError('INVALID_MESSAGE: playerOnly Message option must be a string.');
    }


    super();
    this.options = options;
    this.message = options.message;
    this.hangman = options.hangman;
    this.word = options.customWord;
    this.buttonPage = 0;
    this.guessed = [];
    this.damage = 0;
  }


  getBoardContent() {
    let board = '```\n|‾‾‾‾‾‾| \n|      ';
    board += (this.damage > 0 ? this.hangman.hat : ' ')   + ' \n|      ';
    board += (this.damage > 1 ? this.hangman.head : ' ')  + ' \n|      ';
    board += (this.damage > 2 ? this.hangman.shirt : ' ') + ' \n|      ';
    board += (this.damage > 3 ? this.hangman.pants : ' ') + ' \n|     ';
    board += (this.damage > 4 ? this.hangman.boots : ' ') + ' \n|     ';
    board += '\n|__________                      ```';
    return board;
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

    if (!this.word) {
      const themeWords = words[this.options.theme];
      this.word = themeWords[Math.floor(Math.random() * themeWords.length)];
    }

    
    const embed = new EmbedBuilder()
    .setColor(this.options.embed.color)
    .setTitle(this.options.embed.title)
    .setDescription(this.getBoardContent())
    .setAuthor({ name: this.message.author.tag, iconURL: this.message.author.displayAvatarURL({ dynamic: true }) })
    .addFields({ name: `Word (${this.word.length})`, value: this.getWordEmojis() });

    const msg = await this.sendMessage({ embeds: [embed], components: this.getComponents() });
    return this.handleButtons(msg);
  }


  handleButtons(msg) {
    const collector = msg.createMessageComponentCollector({ idle: this.options.timeoutTime });
    

    collector.on('collect', async btn => {
      await btn.deferUpdate().catch(e => {});
      if (btn.user.id !== this.message.author.id) {
        if (this.options.playerOnlyMessage) btn.followUp({ content: formatMessage(this.options, 'playerOnlyMessage'), ephemeral: true });
        return;
      }

      const guess = btn.customId.split('_')[1];
      if (guess === 'stop') return collector.stop();
      if (guess == 0 || guess == 1) return msg.edit({ components: this.getComponents(parseInt(guess)) });
      if (this.guessed.includes(guess)) return;
      this.guessed.push(guess);

      if (!this.word.toUpperCase().includes(guess)) this.damage += 1;
      if (this.damage > 4 || this.foundWord()) return collector.stop();


      const embed = new EmbedBuilder()
      .setColor(this.options.embed.color)
      .setTitle(this.options.embed.title)
      .setDescription(this.getBoardContent())
      .setAuthor({ name: this.message.author.tag, iconURL: this.message.author.displayAvatarURL({ dynamic: true }) })
      .addFields({ name: 'Letters Guessed', value: '`'+ this.guessed.join(', ') +'`' })
      .addFields({ name: `Word (${this.word.length})`, value: this.getWordEmojis() });

      return msg.edit({ embeds: [embed], components: this.getComponents() });
    })

    collector.on('end', (_, reason) => {
      if (reason === 'idle' || reason === 'user') return this.gameOver(msg, this.foundWord());
    })
  }


  gameOver(msg, result) {
    const HangmanGame = { player: this.message.author, word: this.word, damage: this.damage, guessed: this.guessed };
    const GameOverMessage = (result ? this.options.winMessage : this.options.loseMessage);
    this.emit('gameOver', { result: (result ? 'win' : 'lose'), ...HangmanGame });

    
    const embed = new EmbedBuilder()
    .setColor(this.options.embed.color)
    .setTitle(this.options.embed.title)
    .setDescription(this.getBoardContent())
    .setAuthor({ name: this.message.author.tag, iconURL: this.message.author.displayAvatarURL({ dynamic: true }) });

    if (this.guessed.length) embed.addFields({ name: 'Letters Guessed', value: '`'+ this.guessed.join(', ') +'`' });
    embed.addFields({ name: 'Game Over', value: GameOverMessage.replace('{word}', this.word) });
    return msg.edit({ embeds: [embed], components: [] });
  }


  foundWord() {
    return this.word.toUpperCase().replace(/ /g, '').split('').every(l => this.guessed.includes(l));
  }

  getWordEmojis() {
    return this.word.toUpperCase().split('').map(l => this.guessed.includes(l) ? getAlphaEmoji(l) : ((l === ' ') ? '⬜' : '🔵')).join(' ');
  }

  getComponents(page) {
    const components = [];
    if (page == 0 || page == 1) this.buttonPage = page;
    const letters = getAlphaEmoji(this.buttonPage ?? 0);
    const pageID = ('hangman_' + (this.buttonPage ? 0 : 1));

    for (let y = 0; y < 3; y++) {
      const row = new ActionRowBuilder();
      for (let x = 0; x < 4; x++) {
        
        const letter = letters[y * 4 + x];
        const btn = new ButtonBuilder().setStyle('PRIMARY').setLabel(letter).setCustomId(`hangman_${letter}`)
        .setDisabled(this.guessed.includes(letter));
        row.addComponents(btn);
      }
      components.push(row);
    }

    const row4 = new ActionRowBuilder();
    const stop = new ButtonBuilder().setStyle('DANGER').setLabel('Stop').setCustomId('hangman_stop');
    const pageBtn = new ButtonBuilder().setStyle('SUCCESS').setEmoji(this.buttonPage ? '⬅️' : '➡️').setCustomId(pageID);
    const letterY = new ButtonBuilder().setStyle('PRIMARY').setLabel('Y').setCustomId('hangman_Y');
    const letterZ = new ButtonBuilder().setStyle('PRIMARY').setLabel('Z').setCustomId('hangman_Z');

    if (this.guessed.includes('Y')) letterY.setDisabled(true);
    if (this.guessed.includes('Z')) letterZ.setDisabled(true);
    
    row4.addComponents(pageBtn, stop);
    if (this.buttonPage) row4.addComponents(letterY, letterZ);
    components.push(row4);
    return components;
  }
}