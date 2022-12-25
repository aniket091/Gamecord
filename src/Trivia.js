const { EmbedBuilder, ActionRowBuilder } = require('discord.js');
const { decode, formatMessage, shuffleArray, disableButtons, ButtonBuilder } = require('../utils/utils');
const difficulties = ['easy', 'medium', 'hard'];
const fetch = require('node-fetch');
const events = require('events');


module.exports = class Trivia extends events {
  constructor(options = {}) {

    if (!options.isSlashGame) options.isSlashGame = false;
    if (!options.message) throw new TypeError('NO_MESSAGE: No message option was provided.');
    if (typeof options.message !== 'object') throw new TypeError('INVALID_MESSAGE: message option must be an object.');
    if (typeof options.isSlashGame !== 'boolean') throw new TypeError('INVALID_COMMAND_TYPE: isSlashGame option must be a boolean.');


    if (!options.embed) options.embed = {};
    if (!options.embed.title) options.embed.title = 'Trivia';
    if (!options.embed.color) options.embed.color = '#5865F2';
    if (!options.embed.description) options.embed.description = 'You have 60 seconds to guess the answer.';

    if (!options.mode) options.mode = 'multiple';
    if (!options.timeoutTime) options.timeoutTime = 60000;
    if (!options.buttonStyle) options.buttonStyle = 'PRIMARY';
    if (!options.trueButtonStyle) options.trueButtonStyle = 'SUCCESS';
    if (!options.falseButtonStyle) options.falseButtonStyle = 'DANGER';
    if (!options.difficulty) options.difficulty = difficulties[Math.floor(Math.random()*difficulties.length)];

    if (!options.winMessage) options.winMessage = 'You won! The correct answer is {answer}.';
    if (!options.loseMessage) options.loseMessage = 'You lost! The correct answer is {answer}.';
    if (!options.errMessage) options.errMessage = 'Unable to fetch question data! Please try again.';


    if (typeof options.embed !== 'object') throw new TypeError('INVALID_EMBED: embed option must be an object.');
    if (typeof options.embed.title !== 'string') throw new TypeError('INVALID_EMBED: embed title must be a string.');
    if (typeof options.embed.color !== 'string') throw new TypeError('INVALID_EMBED: embed color must be a string.');
    if (typeof options.embed.description !== 'string') throw new TypeError('INVALID_EMBED: embed description must be a string.');
    if (typeof options.timeoutTime !== 'number') throw new TypeError('INVALID_TIME: Timeout time option must be a number.');
    if (typeof options.difficulty !== 'string') throw new TypeError('INVALID_DIFICULTY: Difficulty option must be a string.');
    if (typeof options.winMessage !== 'string') throw new TypeError('INVALID_MESSAGE: Win message option must be a string.');
    if (typeof options.loseMessage !== 'string') throw new TypeError('INVALID_MESSAGE: Lose message option must be a string.');
    if (typeof options.errMessage !== 'string') throw new TypeError('INVALID_MESSAGE: Error message option must be a string.');
    if (typeof options.buttonStyle !== 'string') throw new TypeError('INVALID_BUTTON_STYLE: button style must be a string.');
    if (typeof options.trueButtonStyle !== 'string') throw new TypeError('INVALID_BUTTON_STYLE: button style must be a string.');
    if (typeof options.falseButtonStyle !== 'string') throw new TypeError('INVALID_BUTTON_STYLE: button style must be a string.');
    if (!['multiple', 'single'].includes(options.mode)) throw new TypeError('INVALID_MODE: Mode option must be multiple or single.');
    if (!difficulties.includes(options.difficulty)) throw new TypeError('INVALID_DIFFICULTY: Difficulty option must be a easy, medium or hard.');
    if (options.playerOnlyMessage !== false) {
      if (!options.playerOnlyMessage) options.playerOnlyMessage = 'Only {player} can use these buttons.';
      if (typeof options.playerOnlyMessage !== 'string') throw new TypeError('INVALID_MESSAGE: playerOnly Message option must be a string.');
    }


    super();
    this.options = options;
    this.message = options.message;
    this.selected = null;
    this.trivia = {};
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

    await this.getTriviaQuestion();
    if (!this.trivia.question) return this.sendMessage({ content: this.options.errMessage });


    const embed = new EmbedBuilder()
    .setColor(this.options.embed.color)
    .setTitle(this.options.embed.title)
    .setDescription(`**${this.trivia.question}**\n\n**Difficulty:** ${this.trivia.difficulty}\n**Category:** ${this.trivia.category}`)
    .setAuthor({ name: this.message.author.tag, iconURL: this.message.author.displayAvatarURL({ dynamic: true }) })
    .addFields({ name: '\u200b', value: this.options.embed.description });

    const msg = await this.sendMessage({ embeds: [embed], components: this.getComponents() });
    const collector = msg.createMessageComponentCollector({ idle: this.options.timeoutTime });


    collector.on('collect', async btn => {
      await btn.deferUpdate().catch(e => {});
      if (btn.user.id !== this.message.author.id) {
        if (this.options.playerOnlyMessage) btn.followUp({ content: formatMessage(this.options, 'playerOnlyMessage'), ephemeral: true });
        return;
      }

      collector.stop();
      this.selected = btn.customId.split('_')[1];
      return this.gameOver(msg, this.trivia.options[this.selected-1] === this.trivia.answer);    
    })

    collector.on('end', async (_, reason) => {
      if (reason === 'idle') return this.gameOver(msg, false);
    })
  }

  async gameOver(msg, result) {
    const TriviaGame = { player: this.message.author, question: this.trivia, selected: this.trivia.options[this.selected-1] || this.selected };
    const GameOverMessage = result ? this.options.winMessage : this.options.loseMessage;
    this.emit('gameOver', { result: result? 'win' : 'lose', ...TriviaGame });


    const embed = new EmbedBuilder()
    .setColor(this.options.embed.color)
    .setTitle(this.options.embed.title)
    .setDescription(`**${this.trivia.question}**\n\n**Difficulty:** ${this.trivia.difficulty}\n**Category:** ${this.trivia.category}`)
    .setAuthor({ name: this.message.author.tag, iconURL: this.message.author.displayAvatarURL({ dynamic: true }) })
    .addFields({ name: '\u200b', value: this.options.embed.description });

    return await msg.edit({ content: GameOverMessage.replace('{answer}', this.trivia.answer), embeds: [embed], components: disableButtons(this.getComponents(true)) });
  }


  getComponents(gameOver) {
    const row = new ActionRowBuilder();

    if (this.options.mode === 'multiple') {
      if (gameOver && !this.selected) this.selected = (this.trivia.options.indexOf(this.trivia.answer) + 1);
      const style = this.selected ? 'SECONDARY' : this.options.buttonStyle;
      const btn1 = new ButtonBuilder().setStyle(style).setCustomId('trivia_1').setLabel(this.trivia.options[0]);
      const btn2 = new ButtonBuilder().setStyle(style).setCustomId('trivia_2').setLabel(this.trivia.options[1]);
      const btn3 = new ButtonBuilder().setStyle(style).setCustomId('trivia_3').setLabel(this.trivia.options[2]);
      const btn4 = new ButtonBuilder().setStyle(style).setCustomId('trivia_4').setLabel(this.trivia.options[3]);
      row.addComponents(btn1, btn2, btn3, btn4);

      if (this.selected) {
        if (this.trivia.answer !== this.trivia.options[this.selected-1]) row.components[this.selected-1].setStyle(this.options.falseButtonStyle);
        else row.components[this.selected-1].setStyle(this.options.trueButtonStyle);
      }
    } 
    else {
      if (gameOver && !this.selected) this.selected = this.trivia.answer;
      const btn1 = new ButtonBuilder().setStyle(this.selected ? 'SECONDARY' : this.options.trueButtonStyle).setCustomId('trivia_True').setLabel('True');
      const btn2 = new ButtonBuilder().setStyle(this.selected ? 'SECONDARY' : this.options.falseButtonStyle).setCustomId('trivia_False').setLabel('False');
      row.addComponents(btn1, btn2);

      if (this.selected) {
        if (this.selected === 'True') btn1.setStyle((this.selected === this.trivia.answer) ? 'SUCCESS' : 'DANGER');
        else btn2.setStyle((this.selected === this.trivia.answer) ? 'SUCCESS' : 'DANGER');
      }
    }

    return [row];
  }


  async getTriviaQuestion() {
    const questionMode = this.options.mode.replace('single', 'boolean');
    const url = `https://opentdb.com/api.php?amount=1&type=${questionMode}&difficulty=${this.options.difficulty}`;
    const result = await fetch(url).then(res => res.json()).then(res => res.results[0]).catch(e => {});
    if (!result) return false;

    this.trivia = {
      question: decode(result.question),
      difficulty: decode(result.difficulty),
      category: decode(result.category),
      answer: decode(result.correct_answer),
      options: []
    }

    if (questionMode === 'multiple') {
      result.incorrect_answers.push(result.correct_answer);
      this.trivia.options = shuffleArray(result.incorrect_answers).map(e => decode(e));
    }
  }
}