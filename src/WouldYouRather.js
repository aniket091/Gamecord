const { MessageEmbed, MessageButton, MessageActionRow } = require('discord.js');
const fetch = require('node-fetch');


module.exports = class Trivia {
	constructor(options = {}) {
		if (!options.message) throw new TypeError('NO_MESSAGE: Please provide a message arguement')
		if (typeof options.message !== 'object') throw new TypeError('INVALID_MESSAGE: Invalid Discord Message object was provided.')
		if (!options.slash_command) options.slash_command = false;
		if (typeof options.slash_command !== 'boolean') throw new TypeError('INVALID_COMMAND_TYPE: Slash command must be a boolean.')


		if (!options.embed) options.embed = {};
		if (typeof options.embed !== 'object') throw new TypeError('INVALID_EMBED_OBJECT: Embed arguement must be an object.')
		if (!options.embed.title) options.embed.title = 'Would You Rather';
		if (typeof options.embed.title !== 'string')  throw new TypeError('INVALID_TITLE: Embed Title must be a string.')
		if (!options.embed.color) options.embed.color = '#5865F2';
		if (typeof options.embed.color !== 'string')  throw new TypeError('INVALID_COLOR: Embed Color must be a string.')


		if (!options.buttons) options.buttons = {};
		if (typeof options.buttons !== 'object') throw new TypeError('INVALID_BUTTON_OBJECT: Buttons arguement must be an object.')
		if (!options.buttons.option1) options.buttons.option1 = 'Option 1';
		if (typeof options.buttons.option1 !== 'string') throw new TypeError('INVALID_BUTTON: Option1 Button must be a string.')
		if (!options.buttons.option2) options.buttons.option2 = 'Option 2';
		if (typeof options.buttons.option2 !== 'string') throw new TypeError('INVALID_BUTTON: Option2 Button must be a string.')


		if (!options.othersMessage) options.othersMessage = 'You are not allowed to use buttons for this message!';
		if (typeof options.othersMessage !== 'string') throw new TypeError('INVALID_OTHERS_MESSAGE: Others Message must be a string.')
		if (!options.thinkMessage) options.thinkMessage = '**Thinking...**';
		if (typeof options.thinkMessage !== 'string') throw new TypeError('INVALID_THINK_MESSAGE: Think Message must be a string.')


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
		let thinkMsg; 
		
		if (!this.options.slash_command) thinkMsg = await this.message.channel.send({ embeds: [
			new MessageEmbed().setDescription(this.options.thinkMessage).setColor(this.options.embed.color)
		]})


		await fetch('https://api.aniketdev.cf/wyr')
		.then(res => res.json())
		.then(res => {
			data = res.data;
		})

		const embed = new MessageEmbed()
		.setTitle(this.options.embed.title)
		.setColor(this.options.embed.color)
		.setDescription(`1. ${data.option_1}\n2. ${data.option_2}`)
		.setAuthor(this.message.author.tag, this.message.author.displayAvatarURL({ dynamic: true}))
		.addField('\u200b', `**Title:** ${data.title}\n**Author:** ${data.author}`)

		let btn1 = new MessageButton().setStyle('PRIMARY').setLabel(this.options.buttons.option1).setCustomId('1_wyr');
		let btn2 = new MessageButton().setStyle('PRIMARY').setLabel(this.options.buttons.option2).setCustomId('2_wyr');
		let row = new MessageActionRow().addComponents(btn1, btn2)

		if (thinkMsg && !thinkMsg.deleted) thinkMsg.delete().catch();

		const msg = await this.sendMessage({  embeds: [embed], components: [row]  })

		const filter = m => m;
		const collector = msg.createMessageComponentCollector({
			filter,
		})


		collector.on('collect', async btn => {
			if (btn.user.id !== this.message.author.id) return btn.reply({ content: this.options.othersMessage.replace('{author}', this.message.author.tag),  ephemeral: true })

			collector.stop();
			await btn.deferUpdate();

			const percentage1 = parseInt(data.option1_votes) / (parseInt(data.option1_votes) + parseInt(data.option2_votes)) * 100;
			const percentage2 = parseInt(data.option2_votes) / (parseInt(data.option1_votes) + parseInt(data.option2_votes)) * 100;

			const ReplyEmbed = new MessageEmbed()
			.setTitle(this.options.embed.title)
			.setColor(this.options.embed.color)
			.setAuthor(this.message.author.tag, this.message.author.displayAvatarURL({ dynamic: true}))
			.addField('\u200b', `**Title:** ${data.title}\n**Author:** ${data.author}`)

			if (btn.customId === '1_wyr') {
				ReplyEmbed.setDescription(`**1. ${data.option_1} (${percentage1.toFixed(0)}%)**\n2. ${data.option_2} (${percentage2.toFixed(0)})%`)
			} else if (btn.customId === '2_wyr') {
				ReplyEmbed.setDescription(`1. ${data.option_1} (${percentage1.toFixed(0)}%)\n**2. ${data.option_2} (${percentage2.toFixed(0)})%**`)
			}

			return msg.edit({ embeds: [ReplyEmbed], components: [] })
		})
	}
}