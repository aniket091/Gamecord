const { EmbedBuilder, ActionRowBuilder } = require('discord.js');
const { disableButtons, formatMessage, ButtonBuilder } = require('../utils/utils');
const events = require('events');
const HEIGHT = 10;
const WIDTH = 15;


module.exports = class SnakeGame extends events {
  constructor(options = {}) {

    if (!options.isSlashGame) options.isSlashGame = false;
    if (!options.message) throw new TypeError('NO_MESSAGE: No message option was provided.');
    if (typeof options.message !== 'object') throw new TypeError('INVALID_MESSAGE: message option must be an object.');
    if (typeof options.isSlashGame !== 'boolean') throw new TypeError('INVALID_COMMAND_TYPE: isSlashGame option must be a boolean.');


    if (!options.embed) options.embed = {};
    if (!options.embed.title) options.embed.title = 'Snake Game';
    if (!options.embed.color) options.embed.color = '#5865F2';
    if (!options.embed.overTitle) options.embed.overTitle = 'Game Over';

    if (!options.snake) options.snake = {};
    if (!options.snake.head) options.snake.head = '🟢';
    if (!options.snake.body) options.snake.body = '🟩';
    if (!options.snake.tail) options.snake.tail = '🟢';
    if (!options.snake.skull) options.snake.skull = '💀';

    if (!options.emojis) options.emojis = {};
    if (!options.emojis.board) options.emojis.board = '⬛';
    if (!options.emojis.food) options.emojis.food = '🍎';
    
    if (!options.emojis.up) options.emojis.up = '⬆️';
    if (!options.emojis.down) options.emojis.down = '⬇️';
    if (!options.emojis.left) options.emojis.left = '⬅️';
    if (!options.emojis.right) options.emojis.right = '➡️';

    if (!options.foods) options.foods = [];
    if (!options.stopButton) options.stopButton = 'Stop';
    if (!options.timeoutTime) options.timeoutTime = 60000;
    

    if (typeof options.embed !== 'object') throw new TypeError('INVALID_EMBED: embed option must be an object.');
    if (typeof options.embed.title !== 'string') throw new TypeError('INVALID_EMBED: embed title must be a string.');
    if (typeof options.embed.color !== 'string') throw new TypeError('INVALID_EMBED: embed color must be a string.');
    if (typeof options.embed.overTitle !== 'string') throw new TypeError('INVALID_EMBED: embed overTitle must be a string.');
    if (typeof options.emojis !== 'object') throw new TypeError('INVALID_EMOJI: emojis option must be an object.');
    if (typeof options.emojis.board !== 'string') throw new TypeError('INVALID_EMOJI: board emoji must be a string.');
    if (typeof options.emojis.food !== 'string') throw new TypeError('INVALID_EMOJI: food emoji must be a string.');
    if (typeof options.emojis.up !== 'string') throw new TypeError('INVALID_EMOJI: up emoji must be a string.');
    if (typeof options.emojis.down !== 'string') throw new TypeError('INVALID_EMOJI: down emoji must be a string.');
    if (typeof options.emojis.left !== 'string') throw new TypeError('INVALID_EMOJI: left emoji must be a string.');
    if (typeof options.emojis.right !== 'string') throw new TypeError('INVALID_EMOJI: right emoji must be a string.');
    if (typeof options.timeoutTime !== 'number') throw new TypeError('INVALID_TIME: time option must be a number.');
    if (typeof options.stopButton !== 'string') throw new TypeError('INVALID_STOPBUTTON: StopButton option must be a string.');
    if (!Array.isArray(options.foods)) throw new TypeError('INVALID_FOODS: foods option must be an array.');
    if (options.playerOnlyMessage !== false) {
      if (!options.playerOnlyMessage) options.playerOnlyMessage = 'Only {player} can use these buttons.';
      if (typeof options.playerOnlyMessage !== 'string') throw new TypeError('INVALID_MESSAGE: playerOnly Message option must be a string.');
    }
    

    super();
    this.options = options;
    this.message = options.message;
    this.snake = [{ x: 5, y: 5 }];
    this.apple = { x: 1, y: 1 };
    this.snakeLength = 1;
    this.gameBoard = [];
    this.score = 0;

    for (let y = 0; y < HEIGHT; y++) {
      for (let x = 0; x < WIDTH; x++) {
        this.gameBoard[y * WIDTH + x] = options.emojis.board;
      }
    }
  }


  getBoardContent(isSkull) {
    const emojis = this.options.snake;
    let board = '';

    for (let y = 0; y < HEIGHT; y++) {
      for (let x = 0; x < WIDTH; x++) {
        
        if (x == this.apple.x && y == this.apple.y) {
          board += this.options.emojis.food; 
          continue;
        }

        if (this.isSnake({ x: x, y: y })) {
          const pos = this.snake.indexOf(this.isSnake({ x: x, y: y }));
          if (pos === 0) {
            const isHead = (!isSkull || (this.snakeLength >= (HEIGHT * WIDTH) ));
            board += isHead ? emojis.head : emojis.skull;
          } else if (pos === this.snake.length - 1) {
            board += emojis.tail;
          } else {
            board += emojis.body;
          }
        }

        if (!this.isSnake({ x: x, y: y })) board += this.gameBoard[y * WIDTH + x];
      }
      board += '\n';
    }
    return board;
  }


  isSnake(pos) {
    return this.snake.find(snake => ( snake.x == pos.x && snake.y == pos.y )) ?? false;
  }


  updateFoodLoc() {
    let applePos = { x: 0, y: 0 };
    do {
      applePos = { x: parseInt(Math.random() * WIDTH), y: parseInt(Math.random() * HEIGHT) };
    } while (this.isSnake(applePos));

    const foods = this.options.foods;
    if (foods.length) this.options.emojis.food = foods[Math.floor(Math.random() * foods.length)];
    this.apple = { x: applePos.x, y: applePos.y };
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
    
    const emojis = this.options.emojis;
    this.updateFoodLoc();


    const embed = new EmbedBuilder()
    .setColor(this.options.embed.color)
    .setTitle(this.options.embed.title)
    .setDescription('**Score:** ' + this.score + '\n\n' + this.getBoardContent())
    .setFooter({ text: this.message.author.tag, iconURL: this.message.author.displayAvatarURL({ dynamic: true }) })


    const up = new ButtonBuilder().setEmoji(emojis.up).setStyle('PRIMARY').setCustomId('snake_up');
    const down = new ButtonBuilder().setEmoji(emojis.down).setStyle('PRIMARY').setCustomId('snake_down');
    const left = new ButtonBuilder().setEmoji(emojis.left).setStyle('PRIMARY').setCustomId('snake_left');
    const right = new ButtonBuilder().setEmoji(emojis.right).setStyle('PRIMARY').setCustomId('snake_right');
    const stop = new ButtonBuilder().setLabel(this.options.stopButton).setStyle('DANGER').setCustomId('snake_stop');

    const dis1 = new ButtonBuilder().setLabel('\u200b').setStyle('SECONDARY').setCustomId('dis1').setDisabled(true);
    const dis2 = new ButtonBuilder().setLabel('\u200b').setStyle('SECONDARY').setCustomId('dis2').setDisabled(true);
    const row1 = new ActionRowBuilder().addComponents(dis1, up, dis2, stop);
    const row2 = new ActionRowBuilder().addComponents(left, down, right);

    const msg = await this.sendMessage({ embeds: [embed], components: [row1, row2] });
    return this.handleButtons(msg);
  }


  updateGame(msg) {
    if (this.apple.x == this.snake[0].x && this.apple.y == this.snake[0].y) {
      this.score += 1;
      this.snakeLength += 1;
      this.updateFoodLoc();
    }

    const embed = new EmbedBuilder()
    .setColor(this.options.embed.color)
    .setTitle(this.options.embed.title)
    .setDescription('**Score:** ' + this.score + '\n\n' + this.getBoardContent())
    .setFooter({ text: this.message.author.tag, iconURL: this.message.author.displayAvatarURL({ dynamic: true }) })

    return msg.edit({ embeds: [embed] });
  }


  gameOver(msg) {
    const SnakeGame = { player: this.message.author, score: this.score };
    this.emit('gameOver', { result: (this.snakeLength >= (HEIGHT*WIDTH) ? 'win' : 'lose'), ...SnakeGame });

    
    const embed = new EmbedBuilder()
    .setColor(this.options.embed.color)
    .setTitle(this.options.embed.overTitle)
    .setDescription('**Score:** ' + this.score + '\n\n' + this.getBoardContent(true))
    .setFooter({ text: this.message.author.tag, iconURL: this.message.author.displayAvatarURL({ dynamic: true }) })

    return msg.edit({ embeds: [embed], components: disableButtons(msg.components) });
  }


  handleButtons(msg) {
    const collector = msg.createMessageComponentCollector({ idle: this.options.timeoutTime });

    collector.on('collect', async btn => {
      await btn.deferUpdate().catch(e => {});
      if (btn.user.id !== this.message.author.id) {
        if (this.options.playerOnlyMessage) btn.followUp({ content: formatMessage(this.options, 'playerOnlyMessage'), ephemeral: true });
        return;
      }

      const snakeHead = this.snake[0];
      const nextPos = { x: snakeHead.x, y: snakeHead.y };
      const ButtonID = btn.customId.split('_')[1];


      if (ButtonID === 'left') nextPos.x = ( snakeHead.x - 1 );
      else if (ButtonID === 'right') nextPos.x = ( snakeHead.x + 1 );
      else if (ButtonID === 'down') nextPos.y = ( snakeHead.y + 1 );
      else if (ButtonID === 'up') nextPos.y = ( snakeHead.y - 1 );

      
      if (nextPos.x < 0 || ( nextPos.x >= WIDTH )) {
        nextPos.x = (nextPos.x < 0) ? 0 : (WIDTH - 1);
        return collector.stop();
      }

      if (nextPos.y < 0 || ( nextPos.y >= HEIGHT )) {
        nextPos.y = (nextPos.y < 0) ? 0 : (HEIGHT - 1);
        return collector.stop();
      }


      if (this.isSnake(nextPos) || ButtonID === 'stop') return collector.stop();
      else {
        this.snake.unshift(nextPos);
        if (this.snake.length > this.snakeLength) this.snake.pop();
        this.updateGame(msg);
      }
    })


    collector.on('end', async (_, reason) => {
      if (reason === 'idle' || reason === 'user') return this.gameOver(msg);
    })
  }
}