import {
  ActionRowBuilder,
  ButtonBuilder,
  InteractionEditReplyOptions,
  Message,
  MessageEditOptions,
  MessagePayload,
} from 'discord.js';
import { EventEmitter } from 'node:events';
import { BaseConstructorOptions, ButtonStyle, DeepRequired, MessageType } from './Base';

export interface FindEmojiConstructorOptions<IsSlashGame extends boolean> extends BaseConstructorOptions<IsSlashGame> {
  embed?: {
    title?: string;
    color?: string;
    description?: string;
    findDescription?: string;
  };
  timeoutTime?: number;
  hideEmojiTime?: number;
  buttonStyle?: ButtonStyle;
  emojis?: string[];
  winMessage?: string;
  loseMessage?: string;
  timeoutMessage?: string;
}

export class FindEmoji<IsSlashGame extends boolean = false> extends EventEmitter {
  options: DeepRequired<FindEmojiConstructorOptions<IsSlashGame>>;
  message: MessageType<IsSlashGame>;
  emojis: string[];
  selected: string | null;
  emoji: string | null;

  constructor(options: FindEmojiConstructorOptions<IsSlashGame>);

  sendMessage(
    content: string | MessagePayload | (IsSlashGame extends true ? InteractionEditReplyOptions : MessageEditOptions)
  ): Promise<Message>;
  startGame(): Promise<void>;
  gameOver(msg: Message, result: boolean): Promise<Message>;
  getComponents(showEmoji: boolean): ActionRowBuilder<ButtonBuilder>[];
}
