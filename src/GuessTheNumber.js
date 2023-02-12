const { EmbedBuilder } = require('discord.js')
const EventEmitter = require("node:events")

class GuessTheNumber extends EventEmitter {
    constructor(gtnOptions) {
        super()

        if(!gtnOptions.message) throw new Error("GAMECORD ERROR: Cannot start GTN without a message to work with")

        this.moreThanMessage = gtnOptions?.moreThanMessage ?? "The number you guessed is greater than the number we selected"
        this.lessThanMessage = gtnOptions?.lessThanMessage ?? "The number you guessed is less than the number we selected"
        this.winMessage = gtnOptions?.winMessage ?? "Congratulations {player}! You guessed the correct number"
        this.author = gtnOptions?.isSlashCommand ? gtnOptions.message.user : gtnOptions.message.author
        this.range = {
            lowest: gtnOptions?.range?.lowest ?? 1,
            highest: gtnOptions?.range?.highest ?? 100
        }
        this.message = gtnOptions.message

        this.idleEmbed = {
            title : gtnOptions.idleEmbed?.title || "You are idling",
            description : gtnOptions.idleEmbed?.description || "It looks like you are idling. Because of this, I have stopped the game",
            color : gtnOptions.idleEmbed?.color || "Red",
            footer : gtnOptions.idleEmbed?.footer || "©️ Gamecord Development"
        }

        this.deleteMessages = gtnOptions?.deleteMessages || false

        this.embed = {}

        this.embed.title = gtnOptions?.embed?.title ?? "Guess the number!"
        this.embed.description = gtnOptions?.embed?.description ?? `Guess the number between \`${this.range.lowest}\` and \`${this.range.highest}\`. Just type your predictions in chat!`
        this.embed.color = gtnOptions?.embed?.color ?? "Yellow"
        this.embed.footer = gtnOptions?.embed?.footer ?? "©️ Gamecord development"

        this.tries = 0
        this.timeout = gtnOptions?.timeout ?? 60000
        this.maxTries = gtnOptions?.maxTries ?? 10
        this.win = {}

        this.win.embed = {}

        this.win.embed.title = gtnOptions?.win?.embed?.title ?? "Congratulations!"
        this.win.embed.color = gtnOptions?.win?.embed?.color ?? "Green"
        this.updateText = gtnOptions?.updateText ?? `The number you guessed is **{moreOrLess}** the number we chose. You have \`{tries}\` more tries`
    }

    generateRandomNumber() {
        const rando = Math.round(Math.random() * (this.range.highest - this.range.lowest) + this.range.lowest)
        return rando
    }

    async startGame() {
        const startingEmbed = new EmbedBuilder()
        .setTitle(this.embed.title)
        .setDescription(this.embed.description)
        .setColor(this.embed.color)
        .setFooter({
            text: this.embed.footer
        })

        const initialMessage = await this.message.reply({
            embeds: [startingEmbed],
            fetchReply: true
        })

        const randomNumber = this.generateRandomNumber()
        const filter = m => m.author.id === this.author.id;
        const messageCollector = this.message.channel.createMessageCollector({ idle: this.timeout, filter: filter })

        messageCollector.on("collect", (message) => {
            if(Number.isNaN(Number(message.content))) return

            const guessedNumber = Number(message.content)

            if(guessedNumber === randomNumber) {
                const desc = String(this.winMessage).replace(/{player}/g, this.author.tag)

                const winMessage = new EmbedBuilder()
                .setTitle(this.win.embed.title)
                .setColor(this.win.embed.color)
                .setDescription(desc)
                .setFooter({
                    text: this.embed.footer
                })
                messageCollector.stop()
                this.emit("Gameover", "guessed")
                return message.reply({
                    embeds: [winMessage]
                })
            }

            const tries = this.maxTries - this.tries

            if(tries === 0) {
                const loseEmbed = new EmbedBuilder()
                .setTitle("You lost!")
                .setDescription("You have no more tries!")
                .setColor("Red")
                .setFooter({
                    text: this.embed.footer
                })
                messageCollector.stop()
                this.emit("Gameover", "lost", "no more tries")
                return message.reply({
                    embeds: [loseEmbed]
                })
            }

            this.tries++
            const isMoreThan = guessedNumber > randomNumber

            const firstReplaceDesc = String(this.updateText).replace(/{moreOrLess}/g, isMoreThan ? "more than" : "less than")
            const finalReplaceDesc = firstReplaceDesc.replace(/{tries}/g, tries)

            const noEmbed = new EmbedBuilder()
            .setTitle("You guessed wrong!")
            .setDescription(finalReplaceDesc)
            .setColor("Red")
            .setFooter({
                text: this.embed.footer
            })

            initialMessage.edit({
                embeds: [noEmbed]
            })

            if(this.deleteMessages) message.delete()
        })

        messageCollector.on('end', (_, reason) => {
            if (reason === 'idle') {
                this.emit("Gameover", "lost", "idling")
                const failureEmbed = new EmbedBuilder()
                .setTitle(String(this.idleEmbed.title))
                .setDescription(String(this.idleEmbed.description))
                .setColor(String(this.idleEmbed.color))
                .setFooter({
                    text: String(this.idleEmbed.footer)
                })

                initialMessage.edit({
                    embeds: [failureEmbed]
                })
            }
        })
    }
}

module.exports = GuessTheNumber