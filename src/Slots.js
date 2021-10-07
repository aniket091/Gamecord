const { MessageEmbed } = require('discord.js');
const slots = ['🍇', '🍊', '🍋', '🍌'];


module.exports = class SlotsGame {
    constructor(options = {}) {
        if (!options.message) throw new TypeError('NO_MESSAGE: Please provide a message arguement')
        if (typeof options.message !== 'object') throw new TypeError('INVALID_MESSAGE: Invalid Discord Message object was provided.')

        if (!options.slash_command) options.slash_command = false;
        if (typeof options.slash_command !== 'boolean') throw new TypeError('INVALID_COMMAND_TYPE: Slash command must be a boolean.')

        if (!options.embed) options.embed = {};
        if (typeof options.embed !== 'object') throw new TypeError('INVALID_EMBED_OBJECT: Embed arguement must be an object.')
        
        if (!options.embed.title) options.embed.title = 'Slots';
        if (typeof options.embed.title !== 'string')  throw new TypeError('INVALID_TITLE: Embed Title must be a string.')

        if (!options.embed.color) options.embed.color = '#5865F2';
        if (typeof options.embed.color !== 'string')  throw new TypeError('INVALID_COLOR: Embed Color must be a string.')
        

        this.message = options.message;
        this.options = options;
    }


    async startGame() {
        if (this.options.slash_command) this.message.author = this.message.user;

        const slotOne = Math.floor(Math.random() * slots.length);
		const slotTwo = Math.floor(Math.random() * slots.length);
		const slotThree = Math.floor(Math.random() * slots.length);

        let description = '\n------------------\n';
        description += `${this.wrap(slotOne, false)} : ${this.wrap(slotTwo, false)} : ${this.wrap(slotThree, false)}\n`;
        description += `${slots[slotOne]} : ${slots[slotTwo]} : ${slots[slotThree]} <\n`;
        description += `${this.wrap(slotOne, true)} : ${this.wrap(slotTwo, true)} : ${this.wrap(slotThree, true)}\n`;
        description +=  `------------------\n`;
        description +=  `| : :  ${slotOne === slotTwo && slotOne === slotThree ? 'WIN!' : 'LOST'}  : : |`

        const embed = new MessageEmbed()
        .setColor(this.options.embed.color)
        .setAuthor(this.message.author.tag, this.message.author.displayAvatarURL({ dynamic: true}))
        .addField(this.options.embed.title, '```' +  description + '```')


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

    wrap(slot, add) {
		if (add) {
			if (slot + 1 > slots.length - 1) return slots[0];
			return slots[slot + 1];
		}
		if (slot - 1 < 0) return slots[slots.length - 1];
		return slots[slot - 1];
	}
}