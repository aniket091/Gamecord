const { MessageEmbed, MessageButton, MessageActionRow } = require('discord.js');
const { i, shuffle } = require('../functions/functions')
const difficulties = ['easy', 'medium', 'hard'];
const { decode } = require('html-entities');
const fetch = require('node-fetch');

module.exports = class Trivia {
	constructor(options = {}) {
		if (!options.message) throw new TypeError('NO_MESSAGE: Please provide a message arguement')
		if (typeof options.message !== 'object') throw new TypeError('INVALID_MESSAGE: Invalid Discord Message object was provided.')
        
		if (!options.embed) options.embed = {};
        if (!options.embed.title) options.embed.title = 'Trivia';
        if (typeof options.embed.title !== 'string')  throw new TypeError('INVALID_TITLE: Embed Title must be a string.')

        if (!options.embed.color) options.embed.color = '#5865F2';
        if (typeof options.embed.color !== 'string')  throw new TypeError('INVALID_COLOR: Embed Color must be a string.')
        
		if (!options.embed.description) options.embed.description = 'You have {time} seconds to respond!';
        if (typeof options.embed.description !== 'string')  throw new TypeError('INVALID_DESCRIPTION: Embed Description must be a string.')

		if (!options.buttons) options.buttons = {};
		if (!options.buttons.one) options.buttons.one = '1️⃣';
		if (typeof options.buttons.one !== 'string') throw new TypeError('INVALID_BUTTON_ONE: Button One Emoji must be a string.')
		if (!options.buttons.two) options.buttons.two = '2️⃣';
		if (typeof options.buttons.two !== 'string') throw new TypeError('INVALID_BUTTON_TWO: Button Two Emoji must be a string.')
		if (!options.buttons.three) options.buttons.three = '3️⃣';
		if (typeof options.buttons.three !== 'string') throw new TypeError('INVALID_BUTTON_THREE: Button Third Emoji must be a string.')
		if (!options.buttons.four) options.buttons.four = '4️⃣';
		if (typeof options.buttons.four !== 'string') throw new TypeError('INVALID_BUTTON_FOUR: Button Fourth Emoji must be a string.')

		if (!options.winMessage) options.winMessage = 'GG, Your answer was correct! It was **{answer}**';
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

		this.options = options;
		this.message = options.message;
	}

	async startGame() {
		const data = {};

		const btn_1 = i(15)
		const btn_2 = i(15)
		const btn_3 = i(15)
		const btn_4 = i(15)

		await fetch(`https://opentdb.com/api.php?amount=1&type=multiple&difficulty=${this.options.difficulty}`)
		.then((res) => res.json())
		.then(async (res) => {
			const result = res.results[0];
			await result.incorrect_answers.push(result.correct_answer)
			const shuffled = shuffle(result.incorrect_answers)

			data.question = result.question;
			data.difficulty = result.difficulty;
			data.category = result.category;
			data.options = shuffled;
			data.correct = shuffled.indexOf(result.correct_answer)
		})
    
		
		let winnerID;
		if (data.correct === 0) {
			winnerID = btn_1;
		} else if (data.correct === 1) {
			winnerID = btn_2
		} else if (data.correct === 2) {
			winnerID = btn_3
		} else if (data.correct === 3) {
			winnerID = btn_4
		}
    
		const btn1 = new MessageButton().setStyle('PRIMARY').setCustomId(btn_1).setEmoji(this.options.buttons.one)
		const btn2 = new MessageButton().setStyle('PRIMARY').setCustomId(btn_2).setEmoji(this.options.buttons.two)
		const btn3 = new MessageButton().setStyle('PRIMARY').setCustomId(btn_3).setEmoji(this.options.buttons.three)
		const btn4 = new MessageButton().setStyle('PRIMARY').setCustomId(btn_4).setEmoji(this.options.buttons.four)
		const row = new MessageActionRow().addComponents(btn1, btn2, btn3, btn4)

		let options = data.options.map((o, i) => `**\`${i+=1}\` -** ${decode(o)}`).join('\n')
		let desc = `**${decode(data.question)}**\n\n**Category:** ${data.category}\n**Difficulty:** ${data.difficulty}\n\n**Options**\n${options}`

        const embed = new MessageEmbed()
		.setTitle(this.options.embed.title)
		.setColor(this.options.embed.color)		
		.setDescription(`${desc}\n\n${this.options.embed.description.replace('{time}', Math.floor(this.options.time / 1000))}`)
		.setAuthor(this.message.author.tag, this.message.author.displayAvatarURL({ dynamic: true}))

		const msg = await this.message.channel.send({ embeds: [embed], components: [row] })
        
		const filter = m => m;
        const collector = msg.createMessageComponentCollector({
            filter,
            idle: this.options.time,
        }) 

		collector.on('collect', async btn => {
			if (btn.user.id !== this.message.author.id) return btn.reply({ content: this.options.othersMessage,  ephemeral: true })

			await btn.deferUpdate();
			if (btn.customId === winnerID) {
				for (let x = 0; x < msg.components.length; x++) {
					for (let y = 0; y < msg.components[x].components.length; y++) {
					  msg.components[x].components[y].disabled = true;
					}
				}
				msg.components[0].components[data.correct].style = 'SUCCESS';
				msg.embeds[0].description = desc;

				msg.edit({ content: this.options.winMessage.replace('{answer}', data.options[data.correct]), embeds: msg.embeds, components:  msg.components})

				collector.stop()
			} else {
				for (let x = 0; x < msg.components.length; x++) {
					for (let y = 0; y < msg.components[x].components.length; y++) {
					  msg.components[x].components[y].disabled = true;
					  msg.components[x].components[y].style = 'SECONDARY';
					}
					msg.components[0].components[data.correct].style = 'SUCCESS';
					
					const btns = [btn_1, btn_2, btn_3, btn_4]
					const index = btns.indexOf(btn.customId)
					msg.components[0].components[index].style = 'DANGER';
					msg.embeds[0].description = desc;

					msg.edit({ content: this.options.loseMessage.replace('{answer}', data.options[data.correct]), embeds: msg.embeds, components:  msg.components})
                    collector.stop()  
				}
			}
		})

		collector.on("end", async(c, r) => {
  			if (r === 'time') {
			    for (let y = 0; y < msg.components[x].components.length; y++) {
					msg.components[x].components[y].disabled = true;
					msg.components[x].components[y].style = 'SECONDARY';
				}
				msg.components[0].components[data.correct].style = 'SUCCESS';
				msg.embeds[0].description = desc;

				return msg.edit({ content: this.options.loseMessage.replace('{answer}', data.options[data.correct]), embeds: msg.embeds, components:  msg.components})
			}
			return
  		})
  
	}
}