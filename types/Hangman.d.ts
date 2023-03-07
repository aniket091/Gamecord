import {
  ActionRowBuilder,
  ButtonBuilder,
  InteractionEditReplyOptions,
  Message,
  MessageEditOptions,
  MessagePayload,
} from 'discord.js';
import { EventEmitter } from 'node:events';
import { BaseConstructorOptions, MessageType } from './Base';

// I am bad at naming
export interface HangmanBody {
  hat?: string;
  head?: string;
  shirt?: string;
  pants?: string;
  boots?: string;
}

export interface HangmanConstructorOptions<IsSlashGame extends boolean> extends BaseConstructorOptions<IsSlashGame> {
  embed?: { title?: string; color?: string };
  hangman?: HangmanBody;
  customWord?: string | null;
  timeoutTime?: number;
  theme?: string;
  winMessage?: string;
  loseMessage?: string;
}

export class Hangman<IsSlashGame extends boolean = false> extends EventEmitter {
  options: HangmanConstructorOptions<IsSlashGame>;
  message: MessageType<IsSlashGame>;
  hangman: HangmanBody;
  word: string | null;
  buttonPage: number;
  guessed: string[];
  damage: number;

  constructor(options: HangmanConstructorOptions<IsSlashGame>);

  getBoardContent(): string;
  sendMessage(
    content: string | MessagePayload | (IsSlashGame extends true ? InteractionEditReplyOptions : MessageEditOptions)
  ): Promise<Message>;
  startGame(): Promise<void>;
  handleButtons(msg: Message): void;
  gameOver(msg: Message, result: boolean): Promise<Message>;
  foundWord(): boolean;
  getWordEmojis(): string;
  getComponent(page: number): ActionRowBuilder<ButtonBuilder>;
}
