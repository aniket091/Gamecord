const { randomRange } = require('../utils/utils')
const fishes = require('../utils/fishy.json')

module.exports = class FishyGame {
	constructor(options = {}) {
		if (!options.message) throw new TypeError('NO_MESSAGE: Please provide a message arguement')
		if (typeof options.message !== 'object') throw new TypeError('INVALID_MESSAGE: Invalid Discord Message object was provided.')

		if (!options.fishyMessage) options.fishyMessage = 'You caught a {fish}. I bet it\'d sell for around ${worth}.';
		if (typeof options.fishyMessage !== 'string') throw new TypeError('INVALID_FISHY_MESSAGE: Fishy Message must be a string.')

		if (!options.returnMessage) options.returnMessage = false;
		if (typeof options.returnMessage !== 'boolean') throw new TypeError('INVALID_RETURN_MESSAGE: Return Message must be a boolean.')

		this.options = options;
		this.message =  options.message;
	}

	startGame() {
		let rarity;
		const fishID = Math.floor(Math.random() * 10) + 1;

		if (fishID < 5) rarity = 'junk';
		else if (fishID < 8) rarity = 'common';
		else if (fishID < 10) rarity = 'uncommon';
		else rarity = 'rare';

		const fish = fishes[rarity];
		const worth = randomRange(fish.min, fish.max);

		const content = this.options.fishyMessage.replace('{fish}', fish.symbol).replace('{worth}', worth)
		if (this.options.returnMessage) return content;
		
		if (this.message.deferred) return this.message.editReply({ content: content, allowedMentions: { repliedUser: false }});
		return this.message.reply({ content: content, allowedMentions: { repliedUser: false }});
	}
}