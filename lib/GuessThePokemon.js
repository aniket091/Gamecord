const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');


module.exports = class GuessThePokemon {
    constructor(options = {}) {
        if (!options.message) throw new TypeError('NO_MESSAGE: Please provide a message arguement')
        if (typeof options.message !== 'object') throw new TypeError('INVALID_MESSAGE: Invalid Discord Message object was provided.')
        
		if (!options.embed) options.embed = {};
        if (!options.embed.title) options.embed.title = 'Who\'s This Pokemon?';
        if (typeof options.embed.title !== 'string')  throw new TypeError('INVALID_TITLE: Embed Title must be a string.')

		if (!options.embed.footer) options.embed.footer = 'You have only 1 chance!';
        if (typeof options.embed.footer !== 'string')  throw new TypeError('INVALID_FOOTER: Embed Footer must be a string.')

        if (!options.embed.color) options.embed.color = '#5865f2';
        if (typeof options.embed.color !== 'string')  throw new TypeError('INVALID_COLOR: Embed Color must be a string.')
        
		if (!options.othersMessage) options.othersMessage = 'You are not allowed to use buttons for this message!';
        if (typeof options.othersMessage !== 'string') throw new TypeError('INVALID_OTHERS_MESSAGE: Others Message must be a string.')

		if (!options.winMessage) options.winMessage = 'Your guess was correct! The pokemon was **{pokemon}**';
        if (typeof options.winMessage !== 'string')  throw new TypeError('WIN_MESSAGE: Win Message must be a string.')

		if (!options.stopMessage) options.stopMessage = 'Better luck next time! It was a **{pokemon}**';
        if (typeof options.stopMessage !== 'string')  throw new TypeError('STOP_MESSAGE: Stop Message must be a string.')
        
		if (!options.incorrectMessage) options.incorrectMessage = 'Your guess was incorrect! The pokemon was **{pokemon}**';
        if (typeof options.incorrectMessage !== 'string')  throw new TypeError('INCORRECT_MESSAGE: InCorrect Message must be a string.')
		
		if (!options.time) options.time = 60000;
		if (parseInt(options.time) < 10000) throw new TypeError('TIME_ERROR: Time cannot be less than 10 seconds in ms (i.e 10000 ms)!')
		if (typeof options.time !== 'number') throw new TypeError('INVALID_TIME: Time must be a number!')

		this.options = options;
        this.message = options.message;
    }

	async startGame() {
		const { data } = await fetch('https://api.aniketdev.cf/pokemon').then(res => res.json())
        
		const embed = new MessageEmbed()
		.setAuthor(this.message.author.tag, this.message.author.displayAvatarURL({ dynamic: true}))
		.setColor(this.options.embed.color)
		.setTitle(this.options.embed.title)
		.addField('Types', data.types.join(', ') || 'NO Data!', true)
		.addField('Abilities', data.abilities.join(', ') || 'NO Data!', true)
		.setImage(data.hiddenImage)
		.setFooter(this.options.embed.footer)

		const msg = await this.message.channel.send({ embeds: [embed] })

		const filter = (m) => m.author.id === this.message.author.id;
		const collector = this.message.channel.createMessageCollector({
			filter, 
			max: 5,
			time: this.options.time
		})
        

		collector.on('collect', (message) => {
			collector.stop();
			if (!message.content || message.content.toLowerCase() === 'stop') {
				return msg.channel.send(this.options.stopMessage.replace('{pokemon}', data.name))
			}

			if (message.content.toLowerCase() === data.name.toLowerCase()) {
				const embed = new MessageEmbed()
				.setAuthor(this.message.author.tag, this.message.author.displayAvatarURL({ dynamic: true}))
				.setColor(this.options.embed.color)
				.setTitle(this.options.embed.title)
				.addField('Pokemon Name', data.name || 'Pokemon', true)
				.addField('Types', data.types.join(', ') || 'NO Data!', true)
				.addField('Abilities', data.abilities.join(', ') || 'NO Data!', true)
				.setImage(data.image)
				
 				return msg.channel.send({ content: this.options.winMessage.replace('{pokemon}', data.name), embeds: [embed] })
			} else {
				return msg.channel.send(this.options.incorrectMessage.replace('{pokemon}', data.name))
			}
		});
		collector.on('end', (c, r) => {
			if (r == 'time') return msg.channel.send(this.options.stopMessage.replace('{pokemon}', data.name))
		});

	}

}
