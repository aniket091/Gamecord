import {
  ActionRowBuilder,
  ButtonBuilder,
  InteractionEditReplyOptions,
  Message,
  MessageEditOptions,
  MessagePayload,
  User,
} from 'discord.js';
import { EventEmitter } from 'node:events';
import { BaseConstructorOptions, DeepRequired, MessageType } from './Base';

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
  options: DeepRequired<HangmanConstructorOptions<IsSlashGame>>;
  message: MessageType<IsSlashGame>;
  hangman: HangmanBody;
  word: string | null;
  buttonPage: number;
  guessed: string[];
  damage: number;

  on(
    eventName: 'gameOver',
    listener: (result: {
      result: 'win' | 'lose';
      player: User;
      word: string | null;
      damage: number;
      guessed: string[];
    }) => void
  ): this;
  once(...args: Parameters<this['on']>): this;

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
