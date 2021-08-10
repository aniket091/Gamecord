const { MessageEmbed, MessageButton, MessageActionRow } = require('discord.js')
const { i } = require('../functions/functions')
const WIDTH = 15;
const HEIGHT = 10;
const gameBoard = [];
const apple = { x: 1, y: 1 };


class SnakeGame {
    constructor(options = {}) {
        if (!options.message) throw new TypeError('NO_MESSAGE: Please provide a message arguement')
        if (typeof options.message !== 'object') throw new TypeError('INVALID_MESSAGE: Invalid Discord Message object was provided.')

        
        if (!options.embed) options.embed = {};
        if (!options.embed.title) options.embed.title = 'Snake';
        if (typeof options.embed.title !== 'string')  throw new TypeError('INVALID_TITLE: Embed Title must be a string.')

        if (!options.embed.color) options.embed.color = '#5865F2';
        if (typeof options.embed.color !== 'string')  throw new TypeError('INVALID_COLOR: Embed Color must be a string.')

        if (!options.embed.OverTitle) options.embed.OverTitle = 'Game Over';
        if (typeof options.embed.OverTitle !== 'string')  throw new TypeError('INVALID_OVER_TITLE: Over Title must be a string.')

        
        if (!options.snake) options.snake = {};
        if (!options.snake.head) options.snake.head = '🟢';
        if (typeof options.snake.head !== 'string')  throw new TypeError('INVALID_EMOJI: Snake Head Emoji must be a string.')

        if (!options.snake.body) options.snake.body = '🟩';
        if (typeof options.snake.body !== 'string')  throw new TypeError('INVALID_EMOJI: Snake Body Emoji must be a string.')

        if (!options.snake.tail) options.snake.tail = '🟢';
        if (typeof options.snake.tail !== 'string')  throw new TypeError('INVALID_EMOJI: Snake Tail Emoji must be a string.')

        if (!options.emojis) options.emojis = {};
        if (!options.emojis.board) options.emojis.board = '⬛';
        if (typeof options.emojis.board !== 'string')  throw new TypeError('INVALID_EMOJI: Board Emoji must be a string.')

        if (!options.emojis.food) options.emojis.food = '🍎';
        if (typeof options.emojis.food !== 'string')  throw new TypeError('INVALID_EMOJI: Food Emoji must be a string.')

        if (!options.othersMessage) options.othersMessage = 'You are not allowed to use buttons for this message!';
        if (typeof options.othersMessage !== 'string') throw new TypeError('INVALID_OTHERS_MESSAGE: Others Message must be a string.')

        this.snake = [{ x: 5, y: 5 }];
        this.snakeLength = 1;
        this.score = 0;
        this.inGame = false;
        this.options = options;
        this.message = options.message;

        for (let y = 0; y < HEIGHT; y++) {
            for (let x = 0; x < WIDTH; x++) {
                gameBoard[y * WIDTH + x] = this.options.emojis.board;  // ⬛
            }
        }
    }


    getGameBoard() {
        let str = "";
        let emojis = this.options.snake;

        for (let y = 0; y < HEIGHT; y++) {
            for (let x = 0; x < WIDTH; x++) {
                if (x == apple.x && y == apple.y) {
                    str += this.options.emojis.food;
                    continue;
                }

                let flag = true;
                for (let s = 0; s < this.snake.length; s++) {
                    if (x === this.snake[s].x && y === this.snake[s].y) {

                        if (s === 0) {
                            if (this.inGame)
                                str += emojis.head //🟢
                            else if (this.score == WIDTH * HEIGHT)
                                str += emojis.head //🟢
                            else
                                str += emojis.over || "💀"; //🟢
                        }
                        else if (this.snake.length === 2) {
                            if (s === 1) {
                                str += emojis.body // 🟩
                            }
                        }
                        else if (s === this.snake.length - 1) {
                            str += emojis.tail || emojis.body || "🟢"; //🟢
                        }
                        else {
                            str += emojis.body // 🟩
                        }
                        flag = false;
                    }
                }

                if (flag)
                    str += gameBoard[y * WIDTH + x];
            }
            str += "\n"; 
        }
        return str;
    }

    checkSnake(pos) {
        return this.snake.find(sPos => sPos.x == pos.x && sPos.y == pos.y);
    };

    newFoodLoc() {
        let newApplePos = { x: 0, y: 0 };
        do {
            newApplePos = { x: parseInt(Math.random() * WIDTH), y: parseInt(Math.random() * HEIGHT) };
        } while (this.checkSnake(newApplePos))

        apple.x = newApplePos.x;
        apple.y = newApplePos.y;
    }
    
    async startGame() {
        if (this.inGame) return;
        const emojis = this.options.emojis;

        let btn_up = i(15)
        let btn_left = i(15)
        let btn_down = i(15)
        let btn_right = i(15)
        let btn_stop = i(15)

        this.inGame = true;
        this.score = 0;
        this.snakeLength = 1;
        this.snake = [{ x: 5, y: 5 }];
        this.newFoodLoc();
        this.buttons = { up: btn_up, left: btn_left, down: btn_down, right: btn_right, stop: btn_stop }

        
        const embed = new MessageEmbed()
        .setColor(this.options.embed.color)
        .setTitle(this.options.embed.title)
        .setDescription(`**Score:** ${this.score}\n\n${this.getGameBoard()}`)
        .setFooter(this.message.author.tag, this.message.author.displayAvatarURL({ dynamic: true }))

        
        let up = new MessageButton().setEmoji(emojis.up ? emojis.up : '⬆️').setStyle('PRIMARY').setCustomId(btn_up)
        let left = new MessageButton().setEmoji(emojis.left ? emojis.left : '⬅️').setStyle('PRIMARY').setCustomId(btn_left)
        let down = new MessageButton().setEmoji(emojis.down ? emojis.down : '⬇️').setStyle('PRIMARY').setCustomId(btn_down)
        let right = new MessageButton().setEmoji(emojis.right ? emojis.right : '➡️').setStyle('PRIMARY').setCustomId(btn_right)
        let stop = new MessageButton().setLabel('Stop').setStyle('DANGER').setCustomId(btn_stop)


        let dis1 = new MessageButton().setLabel('\u200b').setStyle('SECONDARY').setCustomId('off').setDisabled(true)
        let dis2 = new MessageButton().setLabel('\u200b').setStyle('SECONDARY').setCustomId('off2').setDisabled(true)
        let dis3 = new MessageButton().setLabel('\u200b').setStyle('SECONDARY').setCustomId('off3').setDisabled(true)


        let row1 = new MessageActionRow().addComponents(dis1, up, dis2, stop)
        let row2 = new MessageActionRow().addComponents(left, down, right, dis3)

        const msg = await this.message.channel.send({ embeds: [embed], components: [row1, row2] })
        this.ButtonCollector(msg)
    }
  

    move(msg) {
        if (apple.x == this.snake[0].x && apple.y == this.snake[0].y) {
            this.score += 1;
            this.snakeLength++;
            this.newFoodLoc();
        }
        
        let emb = msg.embeds[0];
        let embed2 = new MessageEmbed()
        .setColor(emb.color)
        .setTitle(emb.title)
        .setDescription(`**Score:** ${this.score}\n\n${this.getGameBoard()}`)
        .setFooter(this.message.author.tag, this.message.author.displayAvatarURL({ dynamic: true }))
       
        msg.edit({ embeds: [embed2], components: msg.components })  
    }

    async gameOver(msg) {
        this.inGame = false;
        let emb = msg.embeds[0];
        let over = "";
        
        if (this.score == WIDTH * HEIGHT) {
            over = "Winner !"
        } else {
            over = this.options.embed.OverTitle
        }

        const editEmbed = new MessageEmbed()
        .setColor(emb.color)
        .setTitle(emb.title)
        .setDescription(`**${over}**\n**Score:** ${this.score}\n\n${this.getGameBoard()}`)
        .setFooter(this.message.author.tag, this.message.author.displayAvatarURL({ dynamic: true }))
        
        for (let x = 0; x < msg.components.length; x++) {
			for (let y = 0; y < msg.components[x].components.length; y++) {
			  msg.components[x].components[y].disabled = true;
			}
		}

        return await msg.edit({ embeds: [editEmbed], components: msg.components }).catch()   
    }


    ButtonCollector(msg) {
        const filter = m => m;
        const collector = msg.createMessageComponentCollector({
            filter, // Message Filter
            idle: 120000, // 120 seconds
        }) 
        const btns = this.buttons;

        collector.on('collect', async btn => {
            if (btn.user.id !== this.message.author.id) return btn.reply({ content: this.options.othersMessage,  ephemeral: true })
            
            await btn.deferUpdate();
            const snakeHead = this.snake[0];
            const nextPos = { x: snakeHead.x, y: snakeHead.y };
            
            // Left Move
            if (btn.customId === btns.left) {
                let nextX = snakeHead.x - 1;                          
                if (nextX === -1) {
                    this.gameOver(msg);
                    nextPos.x = 0;
                    return
                }
                
                if (nextX < 0)
                    nextX = WIDTH - 1;
                nextPos.x = nextX;
                
            } 
            // Right Move
            else if (btn.customId === btns.right) {
                let nextX = snakeHead.x + 1;
                if (nextX === 15) {
                    this.gameOver(msg);
                    nextPos.x = 14;
                    return
                }

                if (nextX >= WIDTH)
                    nextX = 0;
                nextPos.x = nextX;
            }
            // Up Move
            else if (btn.customId === btns.up) {
                let nextY = snakeHead.y - 1;
                if (nextY === -1) {
                    this.gameOver(msg);
                    nextPos.y = 0;
                    return
                }
                if (nextY < 0)
                    nextY = HEIGHT - 1;
                nextPos.y = nextY;
            }
            // Down Move
            else if (btn.customId === btns.down) {
                let nextY = snakeHead.y + 1;
                if (nextY === 10) {
                    this.gameOver(msg);
                    nextPos.y = 9;
                    return
                }
                if (nextY >= HEIGHT)
                    nextY = 0;
                nextPos.y = nextY;
            } 
            // Stop Move
            else if (btn.customId === btns.stop) {
                this.gameOver(msg)
                collector.stop()
            }

            
            if (this.checkSnake(nextPos)) {
                this.gameOver(msg);
            }
            else {
                this.snake.unshift(nextPos);
                if (this.snake.length > this.snakeLength)
                    this.snake.pop();

                this.move(msg);
            }
        })

        collector.on("end", async() => {
          if (this.inGame == true) return this.gameOver(msg);
        })
    }
}

module.exports = SnakeGame;
