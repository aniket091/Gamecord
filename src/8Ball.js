const { MessageEmbed } = require('discord.js');
const answers = require('../utils/8ball')

module.exports = class EightBall {
	constructor(options = {}) {
		if (!options.message) throw new TypeError('NO_MESSAGE: Please provide a message arguement')
		if (typeof options.message !== 'object') throw new TypeError('INVALID_MESSAGE: Invalid Discord Message object was provided.')

		if (!options.slash_command) options.slash_command = false;
		if (typeof options.slash_command !== 'boolean') throw new TypeError('INVALID_COMMAND_TYPE: Slash command must be a boolean.')

		if(!options.question) throw new TypeError('NO_QUESTION: Please provide an question')
		if (typeof options.question !== 'string') throw new TypeError('INVALID_QUESTION: Question must be a string.')

		if (!options.embed) options.embed = {};
		if (!options.embed.title) options.embed.title = '🎱 8ball';
		if (typeof options.embed.title !== 'string')  throw new TypeError('INVALID_TITLE: Embed Title must be a string.')

		if (!options.embed.color) options.embed.color = '#5865F2';
		if (typeof options.embed.color !== 'string')  throw new TypeError('INVALID_COLOR: Embed Color must be a string.')

		this.message = options.message;
		this.options = options;
	}

	startGame() {
		if (this.options.slash_command) this.message.author = this.message.user;
		
		const embed = new MessageEmbed()
		.setTitle(this.options.embed.title)
		.setColor(this.options.embed.color)
		.addField('Question', this.options.question, false)
		.setThumbnail(this.options.embed.thumbnail || null)
		.addField('Answer', answers[Math.floor(Math.random() * answers.length)], false)
		.setFooter(this.message.author.tag, this.message.author.displayAvatarURL({ dynamic: true }))


		if (this.options.slash_command) {
			if (this.message.deferred) {
				return this.message.editReply({ embeds: [embed] })
			} else {
				return this.message.reply({ embeds: [embed] })
			}
		} else {
			return this.message.channel.send({ embeds: [embed] })
		}
	}
}