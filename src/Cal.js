const calculate = async (...args) => {
    const { evaluate } = await import('mathjs')
    const value = await evaluate(...args)
    return value
}
const { MessageButton, MessageActionRow, MessageEmbed } = require('discord.js')
const defaultOptions = {
    message: null,
    isSlashCommand: false,
    embed: {
        footer: "Gamecord Development",
        title: "Calculator - Made with Gamecord",
        color: "WHITE"
    }
}

class Calculator {
    constructor(options) {
        if(!options || typeof options != 'object') throw new Error('[ Gamecord Error ] Cannot start a calculator process without its options')
        this.options = options
    }

    async startGame() {
        const otherMsg = this.options.otherMessage
        let str = []
        if(!this.options.message) throw new Error('[ Gamecord Error ] Cannot start a calculator process without a message')
        if(typeof this.options.message != 'object') throw new Error('[ Gamecord Error ] Provided message is not a discord message')
        const actionRow1 = new MessageActionRow()
        .addComponents(
            new MessageButton()
            .setCustomId('left_bracket')
            .setStyle('PRIMARY')
            .setLabel('(')
        )
        .addComponents(
            new MessageButton()
            .setCustomId('right_bracket')
            .setLabel(')')
            .setStyle('PRIMARY')
        )
        .addComponents(
            new MessageButton()
            .setCustomId('power')
            .setLabel('^')
            .setStyle('PRIMARY')
        )
        .addComponents(
            new MessageButton()
            .setCustomId('log')
            .setLabel('log')
            .setStyle('PRIMARY')
        )
        .addComponents(
            new MessageButton()
            .setCustomId('clear')
            .setLabel('C')
            .setStyle('DANGER')
        )

        const actionRow2 = new MessageActionRow()
        .addComponents(
            new MessageButton()
            .setCustomId('7')
            .setLabel('7')
            .setStyle('SECONDARY')
        )
        .addComponents(
            new MessageButton()
            .setCustomId('8')
            .setLabel('8')
            .setStyle('SECONDARY')
        )
        .addComponents(
            new MessageButton()
            .setCustomId('9')
            .setLabel('9')
            .setStyle('SECONDARY')
        )
        .addComponents(
            new MessageButton()
            .setCustomId('divide')
            .setLabel('÷')
            .setStyle('PRIMARY')
        )
        .addComponents(
            new MessageButton()
            .setCustomId('delete')
            .setLabel('⌫')
            .setStyle('DANGER')
        )

        const actionRow3 = new MessageActionRow()
        .addComponents(
            new MessageButton()
            .setCustomId('4')
            .setLabel('4')
            .setStyle('SECONDARY')
        )
        .addComponents(
            new MessageButton()
            .setCustomId('5')
            .setLabel('5')
            .setStyle('SECONDARY')
        )
        .addComponents(
            new MessageButton()
            .setCustomId('6')
            .setLabel('6')
            .setStyle('SECONDARY')
        )
        .addComponents(
            new MessageButton()
            .setCustomId('plus')
            .setLabel('+')
            .setStyle('PRIMARY')
        )
        .addComponents(
            new MessageButton()
            .setLabel('⠀')
            .setCustomId('yes')
            .setStyle('SECONDARY')
            .setDisabled(true)
        )

        const actionRow4 = new MessageActionRow()
        .addComponents(
            new MessageButton()
            .setLabel('1')
            .setStyle('SECONDARY')
            .setCustomId('1')
        )
        .addComponents(
            new MessageButton()
            .setLabel('2')
            .setStyle('SECONDARY')
            .setCustomId('2')
        )
        .addComponents(
            new MessageButton()
            .setLabel('3')
            .setStyle('SECONDARY')
            .setCustomId('3')
        )
        .addComponents(
            new MessageButton()
            .setLabel('x')
            .setStyle('PRIMARY')
            .setCustomId('times')
        )
        .addComponents(
            new MessageButton()
            .setLabel('⠀')
            .setCustomId('smth')
            .setStyle('SECONDARY')
            .setDisabled(true)
        )

        const actionRow5 = new MessageActionRow()
        .addComponents(
            new MessageButton()
            .setLabel('.')
            .setStyle('PRIMARY')
            .setCustomId('dot')
        )
        .addComponents(
            new MessageButton()
            .setLabel('0')
            .setStyle('SECONDARY')
            .setCustomId('0')
        )
        .addComponents(
            new MessageButton()
            .setLabel('=')
            .setStyle('SUCCESS')
            .setCustomId('equal')
        )
        .addComponents(
            new MessageButton()
            .setLabel('-')
            .setStyle('PRIMARY')
            .setCustomId('minus')
        )
        .addComponents(
            new MessageButton()
            .setLabel('⠀')
            .setCustomId('hm')
            .setStyle('SECONDARY')
            .setDisabled(true)
        )
        const display = "```\n⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀\n```"
        const embed = new MessageEmbed()
        .setFooter({
            text: this.options.embed.footer || defaultOptions.embed.footer
        })
        .setColor(this.options.embed.color || defaultOptions.embed.color)
        .setTitle(this.options.embed.title || defaultOptions.embed.title)
        .setDescription(display)
        if(this.options.isSlashCommand == undefined || this.options.isSlashCommand == false) {
            const message = await this.options.message.reply({
                embeds: [embed],
                components: [actionRow1, actionRow2, actionRow3, actionRow4, actionRow5]
            })
            const collector = message.createMessageComponentCollector({ idle: 60000 })
            collector.on('collect', async (btn) => {
                const author = this.options.message.author.id
                const authorReplacement = this.options.message.author.tag
                if(btn.user.id !== author) {
                    await btn.deferReply({ ephemeral: true })
                    return btn.followUp({ content: String(otherMsg).replace(/{author}/g, authorReplacement), ephemeral: true })
                }
                await btn.deferUpdate();
                const customId = btn.customId
                if(customId === '1') str.push('1')
                if(customId === '3') str.push('3')
                if(customId === '4') str.push('4')
                if(customId === '5') str.push('5')
                if(customId === '6') str.push('6')
                if(customId === '7') str.push('7')
                if(customId === '8') str.push('8')
                if(customId === '9') str.push('9')
                if(customId === '0') str.push('0')
                if(customId === '2') str.push('2')
                if(customId === 'left_bracket') str.push(' ( ')
                if(customId === 'right_bracket') str.push(' ) ')
                if(customId === 'power') str.push(' ^ ')
                if(customId === 'log') str.push('log( ')
                if(customId === 'clear') {
                    const embed = new MessageEmbed()
                    .setTitle(this.options.embed.title || defaultOptions.embed.title)
                    .setFooter({
                        text: this.options.embed.footer || defaultOptions.embed.footer
                    })
                    .setColor(this.options.embed.color || defaultOptions.embed.color)
                    .setDescription("```\n⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀\n```")
                    btn.editReply({
                        components: [actionRow1, actionRow2, actionRow3, actionRow4, actionRow5],
                        embeds: [embed]
                    })
                    return
                }
                if(customId === 'divide') str.push(' / ')
                if(customId === 'delete') str.pop()
                if(customId === 'plus') str.push(' + ')
                if(customId === 'minus') str.push(' - ')
                if(customId === 'times') str.push(' * ')
                if(customId === 'dot') str.push('.')
                if(customId === 'equal') {
                    const embed2 = new MessageEmbed()
                    .setTitle(this.options.embed.title || defaultOptions.embed.title)
                    .setFooter({
                        text: this.options.embed.footer || defaultOptions.embed.footer
                    })
                    .setColor(this.options.embed.color || defaultOptions.embed.color)
                    .setDescription(`\`\`\`\nCalculating your equlation\n\`\`\``)
                    btn.editReply({
                        embeds: [embed2],
                        components: [actionRow1, actionRow2, actionRow3, actionRow4, actionRow5]
                    })
                    const equation = str.join('')
                    const answer = await calculate(equation)
                    const embed = new MessageEmbed()
                    .setTitle(this.options.embed.title || defaultOptions.embed.title)
                    .setFooter({
                        text: this.options.embed.footer || defaultOptions.embed.footer
                    })
                    .setColor(this.options.embed.color || defaultOptions.embed.color)
                    .setDescription(`\`\`\`\n= ${answer}\n\`\`\``)
                    btn.editReply({
                        embeds: [embed],
                        components: [actionRow1, actionRow2, actionRow3, actionRow4, actionRow5]
                    })
                    str = []
                    return
                }
                const equation = `\`\`\`\n${str.join('')}\n\`\`\``
                const embed = new MessageEmbed()
                .setTitle(this.options.embed.title || defaultOptions.embed.title)
                .setFooter({
                    text: this.options.embed.footer || defaultOptions.embed.footer
                })
                .setColor(this.options.embed.color || defaultOptions.embed.color)
                .setDescription(equation)
                btn.editReply({
                    embeds: [embed],
                    components: [actionRow1, actionRow2, actionRow3, actionRow4, actionRow5]
                })
            })
            collector.on('end', async i => {
                const embed = new MessageEmbed()
                .setTitle(this.options.embed.disabled.title || "Calculator is disabled")
                .setFooter({
                    text: this.options.embed.footer || defaultOptions.embed.footer
                })
                .setColor(this.options.embed.color || defaultOptions.embed.color)
                message.edit({
                    embeds: [embed],
                    components: []
                })
            })
        } else {
            const message = await this.options.message.reply({
                embeds: [embed],
                components: [actionRow1, actionRow2, actionRow3, actionRow4, actionRow5]
            })
            const collector = message.createMessageComponentCollector({ idle: 60000 })
            collector.on('collect', async (btn) => {
                const author = this.options.message.user.id
                const authorReplacement = this.options.message.user.tag
                if(btn.user.id !== author) {
                    await btn.deferReply({ ephemeral: true })
                    return btn.followUp({ content: String(otherMsg).replace(/{author}/g, authorReplacement), ephemeral: true })
                }
                await btn.deferUpdate();
                const customId = btn.customId
                if(customId === '1') str.push('1')
                if(customId === '3') str.push('3')
                if(customId === '4') str.push('4')
                if(customId === '5') str.push('5')
                if(customId === '6') str.push('6')
                if(customId === '7') str.push('7')
                if(customId === '8') str.push('8')
                if(customId === '9') str.push('9')
                if(customId === '0') str.push('0')
                if(customId === '2') str.push('2')
                if(customId === 'left_bracket') str.push(' ( ')
                if(customId === 'right_bracket') str.push(' ) ')
                if(customId === 'power') str.push(' ^ ')
                if(customId === 'log') str.push('log( ')
                if(customId === 'clear') {
                    const embed = new MessageEmbed()
                    .setTitle(this.options.embed.title || defaultOptions.embed.title)
                    .setFooter({
                        text: this.options.embed.footer || defaultOptions.embed.footer
                    })
                    .setColor(this.options.embed.color || defaultOptions.embed.color)
                    .setDescription("```\n⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀\n```")
                    btn.editReply({
                        components: [actionRow1, actionRow2, actionRow3, actionRow4, actionRow5],
                        embeds: [embed]
                    })
                    return
                }
                if(customId === 'divide') str.push(' / ')
                if(customId === 'delete') str.pop()
                if(customId === 'plus') str.push(' + ')
                if(customId === 'minus') str.push(' - ')
                if(customId === 'times') str.push(' * ')
                if(customId === 'dot') str.push('.')
                if(customId === 'equal') {
                    const equation = str.join('')
                    const answer = await calculate(equation)
                    const embed = new MessageEmbed()
                    .setTitle(this.options.embed.title || defaultOptions.embed.title)
                    .setFooter({
                        text: this.options.embed.footer || defaultOptions.embed.footer
                    })
                    .setColor(this.options.embed.color || defaultOptions.embed.color)
                    .setDescription(`\`\`\`\n= ${answer}\n\`\`\``)
                    btn.editReply({
                        embeds: [embed],
                        components: [actionRow1, actionRow2, actionRow3, actionRow4, actionRow5]
                    })
                    str = []
                    return
                }
                const equation = `\`\`\`\n${str.join('')}\n\`\`\``
                const embed = new MessageEmbed()
                .setTitle(this.options.embed.title || defaultOptions.embed.title)
                .setFooter({
                    text: this.options.embed.footer || defaultOptions.embed.footer
                })
                .setColor(this.options.embed.color || defaultOptions.embed.color)
                .setDescription(equation)
                btn.editReply({
                    embeds: [embed],
                    components: [actionRow1, actionRow2, actionRow3, actionRow4, actionRow5]
                })
            })
        }
    }
}

module.exports = Calculator