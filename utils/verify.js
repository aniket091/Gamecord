const { MessageEmbed, MessageButton, MessageActionRow } = require('discord.js');
const { disableButtons } = require('./utils')

async function verify(options) {
    return new Promise(async (res, rej) => {
        const message = options.message;
    	const opponent = options.opponent;

    
        const askEmbed = new MessageEmbed()
        .setTitle(options.embed.askTitle || options.embed.title)
        .setDescription(options.askMessage
            .replace('{challenger}', message.author.toString()).replace('{opponent}', opponent.toString())
        )
        .setColor(options.colors?.green || options.embed.color)
    
        const btn1 = new MessageButton().setLabel(options.buttons?.accept || 'Accept').setStyle('SUCCESS').setCustomId('accept')
        const btn2 = new MessageButton().setLabel(options.buttons?.reject || 'Reject').setStyle('DANGER').setCustomId('reject')
        const row = new MessageActionRow().addComponents(btn1, btn2);
    
    
    	let askMsg;
    	if (options.slash_command) askMsg = await message.editReply({ embeds: [askEmbed], components: [row] })
        else askMsg = await message.channel.send({ embeds: [askEmbed], components: [row] })
    
        const filter = (interaction) => interaction === interaction;
        const interaction = askMsg.createMessageComponentCollector({
            filter, time: 30000
        })
    
        
        await interaction.on('collect', async (btn) => {
            if (btn.user.id !== opponent.id) return btn.reply({ content: options.othersMessage.replace('{author}', opponent.tag),  ephemeral: true })
    
            await btn.deferUpdate();
            interaction.stop(btn.customId)
        });
    
    
        await interaction.on('end', (_, r) => {
            if (r === 'accept') {
                if (!options.slash_command) askMsg.delete().catch();
                return res(true)
            }

            const cancelEmbed = new MessageEmbed()
            .setTitle(options.embed.cancelTitle || options.embed.title)
            .setDescription(options.cancelMessage
                .replace('{challenger}', message.author.toString()).replace('{opponent}', opponent.toString())
            )
            .setColor(options.colors?.red || options.embed.color)

            if (r === 'time') {
                cancelEmbed.setDescription(options.timeEndMessage
                    .replace('{challenger}', message.author.toString()).replace('{opponent}', opponent.toString())
                )
            }


            res(false)
            return askMsg.edit({ embeds: [cancelEmbed], components: disableButtons(askMsg.components) });
        });
    })
}

module.exports = verify;