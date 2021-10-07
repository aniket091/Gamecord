const { MessageEmbed, MessageButton, MessageActionRow } = require('discord.js')
const choice = { a1: 1, a2: 2, a3: 3, b1: 4, b2: 5, b3: 6, c1: 7, c2: 8, c3: 9 };
const { disableButtons } = require('../utils/utils');
const verify = require('../utils/verify')

const NO_MOVE = 0; 
const PLAYER_1 = 1;
const PLAYER_2 = 2;


module.exports = class TicTacToe {
    constructor(options = {}) {
		if (!options.message) throw new TypeError('NO_MESSAGE: Please provide a message arguement')
        if (typeof options.message !== 'object') throw new TypeError('INVALID_MESSAGE: Invalid Discord Message object was provided.')
        if(!options.opponent) throw new TypeError('NO_OPPONENT: Please provide an opponent arguement')
        if (typeof options.opponent !== 'object') throw new TypeError('INVALID_OPPONENT: Invalid Discord User object was provided.')
        if (!options.slash_command) options.slash_command = false;
        if (typeof options.slash_command !== 'boolean') throw new TypeError('INVALID_COMMAND_TYPE: Slash command must be a boolean.')
        
        if (!options.embed) options.embed = {};
        if (!options.embed.title) options.embed.title = 'Tic Tac Toe';
        if (typeof options.embed.title !== 'string')  throw new TypeError('INVALID_TITLE: Embed Title must be a string.')
        if (!options.embed.overTitle) options.embed.overTitle = 'Game Over';
        if (typeof options.embed.overTitle !== 'string')  throw new TypeError('INVALID_OVER_TITLE: Over Title must be a string.')
        if (!options.embed.color) options.embed.color = '#5865F2';
        if (typeof options.embed.color !== 'string')  throw new TypeError('INVALID_COLOR: Embed Color must be a string.')
        

        if (!options.xEmoji) options.xEmoji = '❌';
        if (typeof options.xEmoji !== 'string')  throw new TypeError('INVALID_EMOJI: xEmoji should be a string.')
        if (!options.oEmoji) options.oEmoji = '🔵';
        if (typeof options.oEmoji !== 'string')  throw new TypeError('INVALID_EMOJI: oEmoji should be a string.')
        if (!options.blankEmoji) options.blankEmoji = '➖';
        if (typeof options.blankEmoji !== 'string')  throw new TypeError('INVALID_EMOJI: blankEmoji should be a string.')
        

        if (!options.xColor) options.xColor = 'DANGER';
        if (typeof options.xColor !== 'string')  throw new TypeError('INVALID_COLOR: xColor should be a string.')
        if (!options.oColor) options.oColor = 'PRIMARY';
        if (typeof options.oColor !== 'string')  throw new TypeError('INVALID_COLOR: oColor should be a string.')


        if (!options.askMessage) options.askMessage = 'Hey {opponent}, {challenger} challenged you for a game of Tic Tac Toe!';
        if (typeof options.askMessage !== 'string')  throw new TypeError('ASK_MESSAGE: Ask Messgae must be a string.')
        if (!options.cancelMessage) options.cancelMessage = 'Looks like they refused to have a game of Tic Tac Toe. \:(';
        if (typeof options.cancelMessage !== 'string')  throw new TypeError('CANCEL_MESSAGE: Cancel Message must be a string.')
        if (!options.timeEndMessage) options.timeEndMessage = 'Since the opponent didnt answer, i dropped the game!';
        if (typeof options.timeEndMessage !== 'string')  throw new TypeError('TIME_END_MESSAGE: Time End Message must be a string.')


        if (!options.turnMessage) options.turnMessage = '{emoji} | Its now **{player}** turn!';
        if (typeof options.turnMessage !== 'string')  throw new TypeError('TURN_MESSAGE: Turn Message must be a string.')      
        if (!options.waitMessage) options.waitMessage = 'Waiting for the opponent...';
        if (typeof options.waitMessage !== 'string')  throw new TypeError('WAIT_MESSAGE: Wait Message must be a string.')  

        
        if (!options.gameEndMessage) options.gameEndMessage = 'The game went unfinished :(';
        if (typeof options.gameEndMessage !== 'string')  throw new TypeError('GAME_END_MESSAGE: Game End Message must be a string.')
        if (!options.winMessage) options.winMessage = '{emoji} | **{winner}** won the game!';
        if (typeof options.winMessage !== 'string')  throw new TypeError('WIN_MESSAGE: Win Message must be a string.')
        if (!options.drawMessage) options.drawMessage = 'It was a draw!';
        if (typeof options.drawMessage !== 'string')  throw new TypeError('DRAW_MESSAGE: Draw Message must be a string.')

        
		this.options = options;
        this.message = options.message;
        this.opponent = options.opponent;
		this.gameBoard = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
        this.inGame = false;
		this.xTurn = true;
		// xTurn => author, oTurn => opponent 
    }


    sendMessage(content) {
        if (this.options.slash_command) return this.message.editReply(content)
        else return this.message.channel.send(content)
    }


    async startGame() {
        if (this.options.slash_command) {
            if (!this.message.deferred) await this.message.deferReply();
            this.message.author = this.message.user;
        }

        if (this.opponent.bot) return this.sendMessage('You can\'t play with bots!')
        if (this.opponent.id === this.message.author.id) return this.sendMessage('You cannot play with yourself!')

        const check = await verify(this.options)

        if (check) {
            this.TTTGame();
        }
    }


    async TTTGame() {
		const gameBoard = this.gameBoard;
        this.inGame = true;

		for (let y = 0; y < 3; y++) {
            for (let x = 0; x < 3; x++) {
                gameBoard[x][y] = NO_MOVE;
            }
        }


        const embed = new MessageEmbed()
		.setTitle(`${this.message.author.username} vs. ${this.opponent.username}`)
        .addField(this.options.statusTitle || 'Status', this.options.turnMessage
            .replace('{emoji}', this.getChip())
            .replace('{player}', this.xTurn ? this.message.author.tag : this.opponent.tag)
        )
        .setColor(this.options.embed.color)

        const row1 = new MessageActionRow()
        const row2 = new MessageActionRow()
        const row3 = new MessageActionRow()

        for (let i = 1; i < 4; i++) row1.addComponents(new MessageButton().setCustomId(`a${i}_TicTacToe`).setStyle('SECONDARY').setEmoji(this.options.blankEmoji))
        for (let i = 1; i < 4; i++) row2.addComponents(new MessageButton().setCustomId(`b${i}_TicTacToe`).setStyle('SECONDARY').setEmoji(this.options.blankEmoji))
        for (let i = 1; i < 4; i++) row3.addComponents(new MessageButton().setCustomId(`c${i}_TicTacToe`).setStyle('SECONDARY').setEmoji(this.options.blankEmoji))


        const msg = await this.sendMessage({ embeds: [embed], components: [row1, row2, row3]})

        const filter = m => m;
        const collector = msg.createMessageComponentCollector({
            filter,
            idle: 60000
        })


        collector.on('collect', async btn => {            
            if (btn.user.id !== this.message.author.id && btn.user.id !== this.opponent.id) {
                const authors = this.message.author.tag + 'and' + this.opponent.tag;
                return btn.reply({ content: this.options.othersMessage.replace('{author}', authors),  ephemeral: true })
            }
            
            const turn = this.xTurn ? this.message.author.id : this.opponent.id;

			if (btn.user.id !== turn) {
				return btn.reply({ content: this.options.waitMessage,  ephemeral: true })
			}


			await btn.deferUpdate();
			const index = choice[btn.customId.split('_')[0]] - 1;
			const x = index % 3;
            const y = Math.floor(index / 3);

			const new_btn = new MessageButton()
			.setCustomId(btn.customId)
			.setDisabled(true)
			.setEmoji(this.getChip())
			.setStyle(this.xTurn ? this.options.xColor : this.options.oColor)
            

			msg.components[y].components[x] = new_btn;
            this.placeMove(x, y, this.xTurn ? PLAYER_1: PLAYER_2)


			if (this.isGameOver()) {
				if (this.hasWon(PLAYER_2))
				    this.gameOver({ result: 'winner', name: this.opponent.tag, emoji: this.getChip() }, msg);
				else if (this.hasWon(PLAYER_1))
				    this.gameOver({ result: 'winner', name: this.message.author.tag, emoji: this.getChip() }, msg)
				else
 				   this.gameOver({ result: 'tie' }, msg) 
			}
            
			else {
				this.xTurn = !this.xTurn;

				const replyEmbed = new MessageEmbed(msg.embeds[0])
                .setFields([])
                .addField(this.options.statusTitle || 'Status', this.options.turnMessage
                    .replace('{emoji}', this.getChip())
                    .replace('{player}', this.xTurn ? this.message.author.tag : this.opponent.tag)
                )

				msg.edit({ embeds: [replyEmbed], components: msg.components })
			}	            
        })


        collector.on('end', async(c, r) => {
            if (r === 'idle' && this.inGame == true) this.gameOver({ result: 'timeout' }, msg)
        })

    }


	gameOver(result, msg) {
        this.inGame = false;

        const Embed = new MessageEmbed()
        .setColor(msg.embeds[0].color)
        .setTitle(`${this.message.author.username} vs ${this.opponent.username}`)
        .addField(this.options.embed.overTitle, this.getResultText(result))


		return msg.edit({ embeds: [Embed], components: disableButtons(msg.components) })
    }

	getChip() {
		return this.xTurn ? this.options.xEmoji : this.options.oEmoji;
	}


	placeMove(x, y, player) {
        this.gameBoard[x][y] = player;
    }


	isGameOver() {
        if (this.hasWon(PLAYER_1) || this.hasWon(PLAYER_2))
            return true;

        if (this.AvailablePoints().length == 0) {
            return true;
        }
        return false;
    }

	hasWon(player) {
		var gameBoard = this.gameBoard;
        
        if (gameBoard[0][0] == gameBoard[1][1] && gameBoard[0][0] == gameBoard[2][2] && gameBoard[0][0] == player) {
            return true;
        }

        if (gameBoard[0][2] == gameBoard[1][1] && gameBoard[0][2] == gameBoard[2][0] && gameBoard[0][2] == player) {
            return true;
        }

        for (let i = 0; i < 3; ++i) {
            if (gameBoard[i][0] == gameBoard[i][1] && gameBoard[i][0] == gameBoard[i][2] && gameBoard[i][0] == player) {
                return true;
            }

            if (gameBoard[0][i] == gameBoard[1][i] && gameBoard[0][i] == gameBoard[2][i] && gameBoard[0][i] == player) {
                return true;
            }
        }
        return false;
    }


	AvailablePoints() {
        const availablePoints = [];
        for (let i = 0; i < 3; ++i)
            for (let j = 0; j < 3; ++j)
                if (this.gameBoard[i][j] == NO_MOVE)
                    availablePoints.push({ x: i, y: j });
        return availablePoints;
    }

    
	getResultText(result) {
        if (result.result === 'tie')
            return this.options.drawMessage;
        else if (result.result === 'timeout')
            return this.options.gameEndMessage;
        else if (result.result === 'error')
            return 'ERROR: ' + result.error;
        else
            return this.options.winMessage.replace('{emoji}', result.emoji).replace('{winner}', result.name);
    }
}