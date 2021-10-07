const { MessageEmbed, MessageButton, MessageActionRow } = require('discord.js');
const difficulties = ['easy', 'medium', 'hard'];
const { shuffle } = require('../utils/utils')
const { decode } = require('html-entities');
const fetch = require('node-fetch');


module.exports = class Trivia {
	constructor(options = {}) {
		if (!options.message) throw new TypeError('NO_MESSAGE: Please provide a message arguement')
		if (typeof options.message !== 'object') throw new TypeError('INVALID_MESSAGE: Invalid Discord Message object was provided.')
		if (!options.slash_command) options.slash_command = false;
		if (typeof options.slash_command !== 'boolean') throw new TypeError('INVALID_COMMAND_TYPE: Slash command must be a boolean.')


		if (!options.embed) options.embed = {};
		if (typeof options.embed !== 'object') throw new TypeError('INVALID_EMBED_OBJECT: Embed arguement must be an object.')
		if (!options.embed.title) options.embed.title = 'Trivia';
		if (typeof options.embed.title !== 'string')  throw new TypeError('INVALID_TITLE: Embed Title must be a string.')
		if (!options.embed.color) options.embed.color = '#5865F2';
		if (typeof options.embed.color !== 'string')  throw new TypeError('INVALID_COLOR: Embed Color must be a string.')
		if (!options.embed.description) options.embed.description = '*You have {time} seconds to respond!*';
		if (typeof options.embed.description !== 'string')  throw new TypeError('INVALID_DESCRIPTION: Embed Description must be a string.')


		if (!options.winMessage) options.winMessage = 'Your answer was correct! It was **{answer}**! GG';
		if (typeof options.winMessage !== 'string')  throw new TypeError('WIN_MESSAGE: Win Message must be a string.')
		if (!options.loseMessage) options.loseMessage = 'Your answer was Incorrect! The correct answer was **{answer}**';
		if (typeof options.loseMessage !== 'string')  throw new TypeError('LOSE_MESSAGE: Lose Message must be a string.')


		if (!options.time) options.time = 60000;
		if (parseInt(options.time) < 10000) throw new TypeError('TIME_ERROR: Time cannot be less than 10 seconds in ms (i.e 10000 ms)!')
		if (typeof options.time !== 'number') throw new TypeError('INVALID_TIME: Time must be a number!')

		if (!options.difficulty) options.difficulty = difficulties[Math.floor(Math.random()*difficulties.length)]
		if (typeof options.difficulty !== 'string')  throw new TypeError('INVALID_DIFFICULTY: Trivia Difficulty must be a string.')

		if (!options.othersMessage) options.othersMessage = 'You are not allowed to use buttons for this message!';
		if (typeof options.othersMessage !== 'string') throw new TypeError('INVALID_OTHERS_MESSAGE: Others Message must be a string.')


		this.message = options.message;
		this.options = options;
	}


	async sendMessage(content) {
		if (this.options.slash_command) return await this.message.editReply(content)
		return await this.message.channel.send(content)
	}


	async startGame() {
		if (this.options.slash_command) {
			if (!this.message.deferred) await this.message.deferReply();
			this.message.author = this.message.user;
		}
		let data = {};


		await fetch(`https://opentdb.com/api.php?amount=1&type=multiple&difficulty=${this.options.difficulty}`)
		.then(res => res.json())
		.then(res => {
			const result = res.results[0];
      result.incorrect_answers.push(result.correct_answer);
      let shuffled = shuffle(result.incorrect_answers);
      shuffled = shuffled.map(e => decode(e))
  
      data.question = decode(result.question);
      data.difficulty = decode(result.difficulty);
      data.category = decode(result.category);
      data.options = shuffled;
      data.correct = shuffled.indexOf(result.correct_answer)
		})

		
		const winnerID = (data.correct + 1) + '_trivia';

		const btn1 = new MessageButton().setStyle('PRIMARY').setCustomId('1_trivia').setLabel(data.options[0])
		const btn2 = new MessageButton().setStyle('PRIMARY').setCustomId('2_trivia').setLabel(data.options[1])
		const btn3 = new MessageButton().setStyle('PRIMARY').setCustomId('3_trivia').setLabel(data.options[2])
		const btn4 = new MessageButton().setStyle('PRIMARY').setCustomId('4_trivia').setLabel(data.options[3])
		const row = new MessageActionRow().addComponents(btn1, btn2, btn3, btn4)

		const embed = new MessageEmbed()
		.setTitle(this.options.embed.title)
		.setColor(this.options.embed.color)	
		.setDescription(`**${data.question}**\n${this.options.embed.description.replace('{time}', Math.floor(this.options.time / 1000))}`)
		.setAuthor(this.message.author.tag, this.message.author.displayAvatarURL({ dynamic: true}))
		.addField('Difficulty', `\`${data.difficulty || 'None'}\``)
		.addField('Category', `\`${data.category || 'None'}\``)

		
		const msg = await this.sendMessage({ embeds: [embed], components: [row] })

		const filter = m => m;
		const collector = msg.createMessageComponentCollector({
			filter,
			time: this.options.time,
		})

		collector.on('collect', async btn => {
			if (btn.user.id !== this.message.author.id) return btn.reply({ content: this.options.othersMessage.replace('{author}', this.message.author.tag),  ephemeral: true })

			collector.stop();
			await btn.deferUpdate();
			for (let y = 0; y < msg.components[0].components.length; y++) {
				msg.components[0].components[y].style = 'SECONDARY';
				msg.components[0].components[y].disabled = true;
			}
			msg.components[0].components[data.correct].style = 'SUCCESS';


			if (btn.customId === winnerID) {
				msg.edit({ content: this.options.winMessage.replace('{answer}', data.options[data.correct]), embeds: msg.embeds, components:  msg.components})
			
			} else {
				const index = btn.customId.split('_')[0] - 1;
				msg.components[0].components[index].style = 'DANGER';

				msg.edit({ content: this.options.loseMessage.replace('{answer}', data.options[data.correct]), embeds: msg.embeds, components:  msg.components})
			}
		})


		collector.on('end', async(c, r) => {
			if (r !== 'time') return;

			for (let y = 0; y < msg.components[0].components.length; y++) {
				msg.components[0].components[y].style = 'SECONDARY';
				msg.components[0].components[y].disabled = true;
			}
			msg.components[0].components[data.correct].style = 'SUCCESS';

			return msg.edit({ content: this.options.loseMessage.replace('{answer}', data.options[data.correct]), embeds: msg.embeds, components:  msg.components})
		})
	}
}