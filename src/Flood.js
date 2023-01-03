const { EmbedBuilder, ActionRowBuilder } = require('discord.js');
const { disableButtons, formatMessage, ButtonBuilder } = require('../utils/utils');
const squares = ['🟥', '🟦', '🟧', '🟪', '🟩'];
const events = require('events');


module.exports = class Flood extends events {
  constructor(options = {}) {

    if (!options.isSlashGame) options.isSlashGame = false;
    if (!options.message) throw new TypeError('NO_MESSAGE: No message option was provided.');
    if (typeof options.message !== 'object') throw new TypeError('INVALID_MESSAGE: message option must be an object.');
    if (typeof options.isSlashGame !== 'boolean') throw new TypeError('INVALID_COMMAND_TYPE: isSlashGame option must be a boolean.');


    if (!options.embed) options.embed = {};
    if (!options.embed.title) options.embed.title = 'Flood';
    if (!options.embed.color) options.embed.color = '#5865F2';

    if (!options.difficulty) options.difficulty = 13;
    if (!options.timeoutTime) options.timeoutTime = 60000;
    if (!options.buttonStyle) options.buttonStyle = 'PRIMARY';
    if (!options.winMessage) options.winMessage = 'You won! You took **{turns}** turns.';
    if (!options.loseMessage) options.loseMessage = 'You lost! You took **{turns}** turns.';
    if (options.emojis && Array.isArray(options.emojis)) squares.splice(0, 5, ...options.emojis);


    if (typeof options.embed !== 'object') throw new TypeError('INVALID_EMBED: embed option must be an object.');
    if (typeof options.embed.title !== 'string') throw new TypeError('INVALID_EMBED: embed title must be a string.');
    if (typeof options.embed.color !== 'string') throw new TypeError('INVALID_EMBED: embed color must be a string.');
    if (typeof options.timeoutTime !== 'number') throw new TypeError('INVALID_TIME: Timeout time option must be a number.');
    if (typeof options.difficulty !== 'number') throw new TypeError('INVALID_LENGTH: length option must be a number.');
    if (typeof options.buttonStyle !== 'string') throw new TypeError('INVALID_BUTTON_STYLE: button style must be a string.');
    if (typeof options.winMessage !== 'string') throw new TypeError('INVALID_MESSAGE: Win Message option must be a string.');
    if (typeof options.loseMessage !== 'string') throw new TypeError('INVALID_MESSAGE: Lose Message option must be a string.');
    if (options.playerOnlyMessage !== false) {
      if (!options.playerOnlyMessage) options.playerOnlyMessage = 'Only {player} can use these buttons.';
      if (typeof options.playerOnlyMessage !== 'string') throw new TypeError('INVALID_MESSAGE: playerOnly Message option must be a string.');
    }

    
    super();
    this.options = options;
    this.message = options.message;
    this.length = options.difficulty;
    this.gameBoard = [];
    this.maxTurns = 0;
    this.turns = 0;

    for (let y = 0; y < this.length; y++) {
      for (let x = 0; x < this.length; x++) {
        this.gameBoard[y * this.length + x] = squares[Math.floor(Math.random() * squares.length)];
      }
    }
  }


  getBoardContent() {
    let board = '';
    for (let y = 0; y < this.length; y++) {
      for (let x = 0; x < this.length; x++) {
        board += this.gameBoard[y * this.length + x];
      }
      board += '\n';
    }
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
    this.maxTurns = Math.floor((25 * (this.length * 2)) / 26);


    const embed = new EmbedBuilder()
    .setColor(this.options.embed.color)
    .setTitle(this.options.embed.title)
    .setDescription(this.getBoardContent())
    .addFields({ name: 'Turns', value: `${this.turns}/${this.maxTurns}` })
    .setAuthor({ name: this.message.author.tag, iconURL: this.message.author.displayAvatarURL({ dynamic: true }) });

    
    const btn1 = new ButtonBuilder().setStyle(this.options.buttonStyle).setEmoji(squares[0]).setCustomId('flood_0');
    const btn2 = new ButtonBuilder().setStyle(this.options.buttonStyle).setEmoji(squares[1]).setCustomId('flood_1');
    const btn3 = new ButtonBuilder().setStyle(this.options.buttonStyle).setEmoji(squares[2]).setCustomId('flood_2');
    const btn4 = new ButtonBuilder().setStyle(this.options.buttonStyle).setEmoji(squares[3]).setCustomId('flood_3');
    const btn5 = new ButtonBuilder().setStyle(this.options.buttonStyle).setEmoji(squares[4]).setCustomId('flood_4');
    const row = new ActionRowBuilder().addComponents(btn1, btn2, btn3, btn4, btn5);

    const msg = await this.sendMessage({ embeds: [embed], components: [row] });
    const collector = msg.createMessageComponentCollector({ idle: this.options.timeoutTime });


    collector.on('collect', async btn => {
      await btn.deferUpdate().catch(e => {});
      if (btn.user.id !== this.message.author.id) {
        if (this.options.playerOnlyMessage) btn.followUp({ content: formatMessage(this.options, 'playerOnlyMessage'), ephemeral: true });
        return;
      }

      const update = await this.updateGame(squares[btn.customId.split('_')[1]], msg);
      if (!update && update !== false) return collector.stop();
      if (update === false) return;


      const embed = new EmbedBuilder()
      .setColor(this.options.embed.color)
      .setTitle(this.options.embed.title)
      .setDescription(this.getBoardContent())
      .addFields({ name: 'Turns', value: `${this.turns}/${this.maxTurns}` })
      .setAuthor({ name: this.message.author.tag, iconURL: this.message.author.displayAvatarURL({ dynamic: true }) });

      return await msg.edit({ embeds: [embed], components: [row] });
    })


    collector.on('end', (_, reason) => {
      if (reason === 'idle') return this.gameOver(msg, false);
    })
  }
  

  gameOver(msg, result) {
    const FloodGame = { player: this.message.author, turns: this.turns, maxTurns: this.maxTurns, boardColor: this.gameBoard[0] };
    const GameOverMessage = result ? this.options.winMessage : this.options.loseMessage;
    this.emit('gameOver', { result: (result ? 'win' : 'lose'), ...FloodGame });


    const embed = new EmbedBuilder()
    .setColor(this.options.embed.color)
    .setTitle(this.options.embed.title)
    .setDescription(this.getBoardContent())
    .addFields({ name: 'Game Over', value: GameOverMessage.replace('{turns}', this.turns) })
    .setAuthor({ name: this.message.author.tag, iconURL: this.message.author.displayAvatarURL({ dynamic: true }) });

    return msg.edit({ embeds: [embed], components: disableButtons(msg.components) });
  }


  async updateGame(selected, msg) {
    if (selected === this.gameBoard[0]) return false;
    const firstBlock = this.gameBoard[0];
    const queue = [{ x: 0, y: 0 }];
    const visited = [];
    this.turns += 1;


    while (queue.length > 0) {
      const block = queue.shift();
      if (!block || visited.some(v => v.x === block.x && v.y === block.y)) continue;
      const index = (block.y * this.length + block.x);

      visited.push(block);
      if (this.gameBoard[index] === firstBlock) {
        this.gameBoard[index] = selected;

        const up = { x: block.x, y: block.y - 1 };
        if (!visited.some(v => v.x === up.x && v.y === up.y) && up.y >= 0) queue.push(up);

        const down = { x: block.x, y: block.y + 1 };
        if (!visited.some(v => v.x === down.x && v.y === down.y) && down.y < this.length) queue.push(down);

        const left = { x: block.x - 1, y: block.y };
        if (!visited.some(v => v.x === left.x && v.y === left.y) && left.x >= 0) queue.push(left);

        const right = { x: block.x + 1, y: block.y };
        if (!visited.some(v => v.x === right.x && v.y === right.y) && right.x < this.length) queue.push(right);
      }
    }


    let gameOver = true;
    for (let y = 0; y < this.length; y++) {
      for (let x = 0; x < this.length; x++) {
        if (this.gameBoard[y * this.length + x] !== selected) gameOver = false;
      }
    }

    if (this.turns >= this.maxTurns && !gameOver) return void this.gameOver(msg, false);
    if (gameOver) return void this.gameOver(msg, true);
    return true;
  }
}