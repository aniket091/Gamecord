const { EmbedBuilder } = require("discord.js");
const events = require("events");

module.exports = class GuessTheNumber extends events {
  constructor(options = {}) {
    super();

    if (!options.isSlashGame) options.isSlashGame = false;
    if (!options.message)
      throw new TypeError("NO_MESSAGE: No message option was provided.");
    if (typeof options.message !== "object")
      throw new TypeError("INVALID_MESSAGE: message option must be an object.");
    if (typeof options.isSlashGame !== "boolean")
      throw new TypeError(
        "INVALID_COMMAND_TYPE: isSlashGame option must be a boolean.",
      );

    if (!options.embed) options.embed = {};
    if (!options.embed.title) options.embed.title = "Guess the Number";
    if (!options.embed.color) options.embed.color = "#5865F2";
    if (
      !options.lowerBound ||
      options.lowerBound <= 0 ||
      isNaN(options.lowerBound)
    )
      options.lowerBound = 1;
    if (
      !options.upperBound ||
      options.upperBound <= 0 ||
      isNaN(options.upperBound)
    )
      options.upperBound = 100;
    this.attempts = 0;
    if (!options.timeoutTime) options.timeoutTime = 120000;
    if (!options.maxAttempts) options.maxAttempts = 10;
    if (!options.embed.description)
      options.embed.description = `Guess a number between **${options.lowerBound}** and **${options.upperBound}.**\nYou Have **${options.maxAttempts}** Attempts.`;
    if (!options.winMessage)
      options.winMessage = `You guessed the number! The number was **{number}**. You guessed the number in **{attempts}** attempts.`;
    if (!options.loseMessage)
      options.loseMessage = "You lost! The number was **{number}**.";

    if (typeof options.embed !== "object")
      throw new TypeError("INVALID_EMBED: embed option must be an object.");
    if (typeof options.embed.title !== "string")
      throw new TypeError("INVALID_EMBED: embed title must be a string.");
    if (typeof options.embed.color !== "string")
      throw new TypeError("INVALID_EMBED: embed color must be a string.");
    if (typeof options.embed.description !== "string")
      throw new TypeError("INVALID_EMBED: embed description must be a string.");
    if (typeof options.timeoutTime !== "number")
      throw new TypeError(
        "INVALID_TIME: Timeout time option must be a number.",
      );
    if (typeof options.winMessage !== "string")
      throw new TypeError(
        "INVALID_MESSAGE: Win Message option must be a string.",
      );
    if (typeof options.loseMessage !== "string")
      throw new TypeError(
        "INVALID_MESSAGE: Lose Message option must be a string.",
      );

    this.options = options;
    this.message = options.message;
    this.targetNumber =
      Math.floor(
        Math.random() * (options.upperBound - options.lowerBound + 1),
      ) + options.lowerBound;
  }

  async sendMessage(content) {
    if (this.options.isSlashGame) return await this.message.editReply(content);
    else return await this.message.channel.send(content);
  }

  async startGame() {
    if (this.options.isSlashGame || !this.message.author) {
      if (!this.message.deferred)
        await this.message.deferReply().catch(() => {});
      this.message.author = this.message.user;
      this.options.isSlashGame = true;
    }

    const embed = new EmbedBuilder()
      .setColor(this.options.embed.color)
      .setTitle(this.options.embed.title)
      .setDescription(this.options.embed.description)
      .setFooter({
        text: this.message.author.tag,
        iconURL: this.message.author.displayAvatarURL({ dynamic: true }),
      });

    const msg = await this.sendMessage({ embeds: [embed] });
    this.collector = this.message.channel.createMessageCollector({
      idle: this.options.timeoutTime,
    });

    this.collector.on("collect", (m) => this.handleMessage(m, msg));
    this.collector.on("end", (_, reason) =>
      this.endGame(msg, reason === "idle" ? false : true),
    );
  }

  async handleMessage(m, msg) {
    if (m.author.id !== this.message.author.id) return;
    const guess = parseInt(m.content, 10);

    if (
      isNaN(guess) ||
      guess < this.options.lowerBound ||
      guess > this.options.upperBound
    ) {
      await m.reply(
        `Please enter a valid number between ${this.options.lowerBound} and ${this.options.upperBound}.`,
      );
      return;
    }

    this.attempts++;
    if (guess === this.targetNumber) {
      await this.collector.stop("guessed");
      await m.reply(
        `You guessed the number! The number was **${this.targetNumber}**.`,
      );
    } else {
      const hint = guess < this.targetNumber ? "higher" : "lower";
      await m.reply(
        `Try a **${hint}** number! You have **${this.options.maxAttempts - this.attempts}** attempts left.`,
      );
    }

    if (this.attempts >= this.options.maxAttempts) {
      await this.collector.stop("maxAttempts");
      await m.reply({
        content: `You Reached The Max Attempts!\nThe Number Was **${this.targetNumber}**`,
      });
    }
  }

  async endGame(msg, won) {
    const embed = new EmbedBuilder()
      .setColor(this.options.embed.color)
      .setTitle(this.options.embed.title)
      .setDescription(
        won
          ? this.options.winMessage
              .replace("{number}", this.targetNumber)
              .replace("{attempts}", this.attempts)
          : this.options.loseMessage
              .replace("{number}", this.targetNumber)
              .replace("{attempts}", this.attempts),
      )
      .setFooter({
        text: this.message.author.tag,
        iconURL: this.message.author.displayAvatarURL({ dynamic: true }),
      });

    await msg.edit({ embeds: [embed] });
  }
};
