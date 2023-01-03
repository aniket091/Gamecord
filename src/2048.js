const { EmbedBuilder, ActionRowBuilder, AttachmentBuilder } = require('discord.js');
const { disableButtons, formatMessage, move, oppDirection, ButtonBuilder } = require('../utils/utils');
const chars = '0123456789abcdefghijklmnopqrstuvwxyz';
const events = require('events');


module.exports = class TwoZeroFourEight extends events {
  constructor(options = {}) {

    if (!options.isSlashGame) options.isSlashGame = false;
    if (!options.message) throw new TypeError('NO_MESSAGE: No message option was provided.');
    if (typeof options.message !== 'object') throw new TypeError('INVALID_MESSAGE: message option must be an object.');
    if (typeof options.isSlashGame !== 'boolean') throw new TypeError('INVALID_COMMAND_TYPE: isSlashGame option must be a boolean.');


    if (!options.embed) options.embed = {};
    if (!options.embed.title) options.embed.title = '2048';
    if (!options.embed.color) options.embed.color = '#5865F2';

    if (!options.emojis) options.emojis = {};
    if (!options.emojis.up) options.emojis.up = '⬆️';
    if (!options.emojis.down) options.emojis.down = '⬇️';
    if (!options.emojis.left) options.emojis.left = '⬅️';
    if (!options.emojis.right) options.emojis.right = '➡️';
    
    if (!options.timeoutTime) options.timeoutTime = 60000;
    if (!options.buttonStyle) options.buttonStyle = 'PRIMARY';


    if (typeof options.embed !== 'object') throw new TypeError('INVALID_EMBED: embed option must be an object.');
    if (typeof options.embed.title !== 'string') throw new TypeError('INVALID_EMBED: embed title must be a string.');
    if (typeof options.embed.color !== 'string') throw new TypeError('INVALID_EMBED: embed color must be a string.');
    if (typeof options.emojis !== 'object') throw new TypeError('INVALID_EMOJIS: emojis option must be an object.');
    if (typeof options.emojis.up !== 'string') throw new TypeError('INVALID_EMOJIS: up emoji must be an string.');
    if (typeof options.emojis.down !== 'string') throw new TypeError('INVALID_EMOJIS: down emoji must be an string.');
    if (typeof options.emojis.left !== 'string') throw new TypeError('INVALID_EMOJIS: left emoji must be an string.');
    if (typeof options.emojis.right !== 'string') throw new TypeError('INVALID_EMOJIS: right emoji must be an string.');
    if (typeof options.timeoutTime !== 'number') throw new TypeError('INVALID_TIME: Timeout time option must be a number.');
    if (typeof options.buttonStyle !== 'string') throw new TypeError('INVALID_BUTTON_STYLE: button style must be a string.');
    if (options.playerOnlyMessage !== false) {
      if (!options.playerOnlyMessage) options.playerOnlyMessage = 'Only {player} can use these buttons.';
      if (typeof options.playerOnlyMessage !== 'string') throw new TypeError('INVALID_MESSAGE: playerOnlyMessage option must be a string.');
    }


    super();
    this.options = options;
    this.message = options.message;
    this.gameBoard = [];
    this.mergedPos = [];
    this.length = 4;
    this.score = 0;

    for (let y = 0; y < this.length; y++) {
      for (let x = 0; x < this.length; x++) {
        this.gameBoard[y * this.length + x] = 0;
      }
    }
  }


  async sendMessage(content) {
    if (this.options.isSlashGame) return await this.message.editReply(content);
    else return await this.message.channel.send(content);
  }

  async getBoardImage() {
    const url = 'https://api.aniket091.xyz/2048?board=' + this.gameBoard.map(c => chars[c]).join('');
    return await new AttachmentBuilder(url, { name: 'gameboard.png' });
  }


  async startGame() {
    if (this.options.isSlashGame || !this.message.author) {
      if (!this.message.deferred) await this.message.deferReply().catch(e => {});
      this.message.author = this.message.user;
      this.options.isSlashGame = true;
    }
    this.placeRandomTile();
    this.placeRandomTile();


    const embed = new EmbedBuilder()
    .setTitle(this.options.embed.title)
    .setColor(this.options.embed.color)
    .setImage('attachment://gameboard.png')
    .addFields({ name: 'Current Score', value: this.score.toString() })
    .setFooter({ text: this.message.author.tag, iconURL: this.message.author.displayAvatarURL({ dynamic: true }) });


    const up = new ButtonBuilder().setEmoji(this.options.emojis.up).setStyle(this.options.buttonStyle).setCustomId('2048_up');
    const down = new ButtonBuilder().setEmoji(this.options.emojis.down).setStyle(this.options.buttonStyle).setCustomId('2048_down');
    const left = new ButtonBuilder().setEmoji(this.options.emojis.left).setStyle(this.options.buttonStyle).setCustomId('2048_left');
    const right = new ButtonBuilder().setEmoji(this.options.emojis.right).setStyle(this.options.buttonStyle).setCustomId('2048_right');
    const row = new ActionRowBuilder().addComponents(up, down, left, right);


    const msg = await this.sendMessage({ embeds: [embed], components: [row], files: [await this.getBoardImage()] });
    return this.handleButtons(msg);
  }


  placeRandomTile() {
    let tilePos = { x: 0, y: 0 };

    do {
      tilePos = { x: parseInt(Math.random() * this.length), y: parseInt(Math.random() * this.length) };
    } while (this.gameBoard[tilePos.y * this.length + tilePos.x] != 0)
    this.gameBoard[tilePos.y * this.length + tilePos.x] = (Math.random() > 0.8 ? 2 : 1);
  }


  async handleButtons(msg) {
    const collector = msg.createMessageComponentCollector({ idle: this.options.timeoutTime });


    collector.on('collect', async btn => {
      await btn.deferUpdate().catch(e => {});
      if (btn.user.id !== this.message.author.id) {
        if (this.options.playerOnlyMessage) btn.followUp({ content: formatMessage(this.options, 'playerOnlyMessage'), ephemeral: true });
        return;
      }

      let moved = false;
      this.mergedPos = [];
      const direction = btn.customId.split('_')[1];
      if (direction === 'up' || direction === 'down') moved = this.shiftVertical(direction);
      if (direction === 'left' || direction === 'right') moved = this.shiftHorizontal(direction);

      if (moved) this.placeRandomTile();
      if (this.isGameOver()) return collector.stop();


      const embed = new EmbedBuilder()
      .setTitle(this.options.embed.title)
      .setColor(this.options.embed.color)
      .setImage('attachment://gameboard.png')
      .addFields({ name: 'Current Score', value: this.score.toString() })
      .setFooter({ text: this.message.author.tag, iconURL: this.message.author.displayAvatarURL({ dynamic: true }) });

      return msg.edit({ embeds: [embed], files: [await this.getBoardImage()], attachments: [] });
    })

    collector.on('end', (_, reason) => {
      if (reason === 'idle' || reason === 'user') {
        return this.gameOver(msg, this.gameBoard.includes('b'));
      }
    })
  }


  async gameOver(msg, result) {
    const TwoZeroFourEightGame = { player: this.message.author, score: this.score };
    this.emit('gameOver', { result: (result ? 'win' : 'lose'), ...TwoZeroFourEightGame });

    const embed = new EmbedBuilder()
    .setTitle(this.options.embed.title)
    .setColor(this.options.embed.color)
    .setImage('attachment://gameboard.png')
    .addFields({ name: 'Total Score', value: this.score.toString() })
    .setFooter({ text: this.message.author.tag, iconURL: this.message.author.displayAvatarURL({ dynamic: true }) });

    return msg.edit({ embeds: [embed], components: disableButtons(msg.components), files: [await this.getBoardImage()], attachments: [] });
  }


  isGameOver() {
    let boardFull = true;
    let numMoves = 0;

    for (let y = 0; y < this.length; y++) {
      for (let x = 0; x < this.length; x++) {
        if (this.gameBoard[y * this.length + x] === 0) boardFull = false;
        const posNum = this.gameBoard[y * this.length + x];

        ['down', 'left', 'right', 'up'].forEach(dir => {
          const newPos = move({x, y}, dir);
          if (this.isInsideBlock(newPos) && (this.gameBoard[newPos.y * this.length + newPos.x] === 0 || this.gameBoard[newPos.y * this.length + newPos.x] === posNum)) numMoves++;
        })
      }
    }
    return (boardFull && numMoves === 0);
  }


  shiftVertical(dir) {
    let moved = false;
    for (let x = 0; x < this.length; x++) {
      if (dir === 'up') {
        for (let y = 1; y < this.length; y++) moved = this.shift({ x, y }, 'up') || moved;
      } else {
        for (let y = this.length - 2; y >= 0; y--) moved = this.shift({ x, y }, 'down') || moved;
      }
    }
    return moved;
  }


  shiftHorizontal(dir) {
    let moved = false;
    for (let y = 0; y < this.length; y++) {
      if (dir === 'left') {
        for (let x = 1; x < this.length; x++) moved = this.shift({ x, y }, 'left') || moved;
      } else {
        for (let x = this.length - 2; x >= 0; x--) moved = this.shift({ x, y }, 'right') || moved;
      }
    }
    return moved;
  }


  isInsideBlock(pos) {
    return pos.x >= 0 && pos.y >= 0 && pos.x < this.length && pos.y < this.length;
  }


  shift(pos, dir) {
    let moved = false;
    const movingTile = this.gameBoard[pos.y * this.length + pos.x];
    if (movingTile === 0) return false;


    let set = false;
    let moveTo = pos;
    while (!set) {
      moveTo = move(moveTo, dir);
      const moveToTile = this.gameBoard[moveTo.y * this.length + moveTo.x];

      if (!this.isInsideBlock(moveTo) || (moveToTile !== 0 && moveToTile !== movingTile) || !!this.mergedPos.find(p => p.x === moveTo.x && p.y === moveTo.y)) {
        const moveBack = move(moveTo, oppDirection(dir));
        if (!(moveBack.x === pos.x && moveBack.y === pos.y)) {
          this.gameBoard[pos.y * this.length + pos.x] = 0;
          this.gameBoard[moveBack.y * this.length + moveBack.x] = movingTile;
          moved = true;
        }
        set = true;
      }
      else if (moveToTile === movingTile) {
        moved = true;
        this.gameBoard[moveTo.y * this.length + moveTo.x] += 1;
        this.score += Math.floor(Math.pow(this.gameBoard[moveTo.y * this.length + moveTo.x], 2));
        this.gameBoard[pos.y * this.length + pos.x] = 0;
        this.mergedPos.push(moveTo);
        set = true;
      }
    }

    return moved;
  }
}