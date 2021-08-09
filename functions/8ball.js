const { MessageEmbed } = require('discord.js')

const answers = [
	'Maybe.',
	'Certainly not.',
	'I hope so.',
	'Not in your wildest dreams.',
	'There is a good chance.',
	'Quite likely.',
	'I think so.',
	'I hope not.',
	'I hope so.',
	'Never!',
	'Fuhgeddaboudit.',
	'Ahaha! Really?!?',
	'Pfft.',
	'Sorry, bucko.',
	'Hell, yes.',
	'Hell to the no.',
	'The future is bleak.',
	'The future is uncertain.',
	'I would rather not say.',
	'Who cares?',
	'Possibly.',
	'Never, ever, ever.',
	'There is a small chance.',
	'As I see it, yes',
    'It is certain',
    'It is decidedly so',
    'Most likely',
    'Outlook good',
    'Signs point to yes',
	'Yes!'
];


module.exports = async (options) =>  {
    if (!options.message) throw new TypeError('NO_MESSAGE: Please provide a message arguement')
    if (typeof options.message !== 'object') throw new TypeError('INVALID_MESSAGE: Invalid Discord Message object was provided.')

    if(!options.question) throw new TypeError('NO_QUESTION: Please provide an question')
    if (typeof options.question !== 'string') throw new TypeError('INVALID_QUESTION: Question must be a string.')

    if (!options.embed) options.embed = {};
  	if (!options.embed.title) options.embed.title = '🎱 8ball';
  	if (typeof options.embed.title !== 'string')  throw new TypeError('INVALID_TITLE: Embed Title must be a string.')
  
  	if (!options.embed.color) options.embed.color = '#5865F2';
    if (typeof options.embed.color !== 'string')  throw new TypeError('INVALID_COLOR: Embed Color must be a string.')
     
  	if (!options.question.includes('?') && options.questionMark == true) return options.message.channel.send('**That dosen\'t seems like a question!**')
  
  	const embed = new MessageEmbed()
  	.setTitle(options.embed.title)
  	.setColor(options.embed.color)
  	.addField('Question', options.question, false)
  	.addField('Answer', answers[Math.floor(Math.random() * answers.length)], false)
  	.setFooter(options.message.author.tag, options.message.author.displayAvatarURL({ dynamic: true }))
  
  	return options.message.channel.send({ embeds: [embed] })
}
