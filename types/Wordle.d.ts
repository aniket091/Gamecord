import {
  AttachmentBuilder,
  InteractionEditReplyOptions,
  Message,
  MessageEditOptions,
  MessagePayload,
  User,
} from 'discord.js';
import { EventEmitter } from 'node:events';
import { BaseConstructorOptions, DeepRequired, MessageType } from './Base';

export interface WordleConstructorOptions<IsSlashGame extends boolean> extends BaseConstructorOptions<IsSlashGame> {
  embed?: { title?: string; color?: string };
  customWord?: string | null;
  timeoutTime?: number;
  winMessage?: string;
  loseMessage?: string;
}

export class Wordle<IsSlashGame extends boolean = false> extends EventEmitter {
  options: DeepRequired<WordleConstructorOptions<IsSlashGame>>;
  message: MessageType<IsSlashGame>;
  word: string | null;
  guessed: string[];

  on(
    eventName: 'gameOver',
    listener: (result: { result: 'win' | 'lose'; player: User; word: string | null; guessed: string[] }) => void
  ): this;
  once(...args: Parameters<this['on']>): this;

  constructor(options: WordleConstructorOptions<IsSlashGame>);

  sendMessage(
    content: string | MessagePayload | (IsSlashGame extends true ? InteractionEditReplyOptions : MessageEditOptions)
  ): Promise<Message>;
  getBoardImage(): Promise<AttachmentBuilder>; // There is no reason to make this asynchronous
  startGame(): Promise<void>;
  gameOver(msg: Message): Promise<Message>;
}
