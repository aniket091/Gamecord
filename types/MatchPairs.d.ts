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
import { BaseConstructorOptions, DeepRequired, MessageType, Position } from './Base';

export interface MatchPairsConstructorOptions<IsSlashGame extends boolean> extends BaseConstructorOptions<IsSlashGame> {
  embed?: { title?: string; color?: string; description?: string };
  timeoutTime?: number;
  emojis?: string[];
  winMessage?: string;
  loseMessage?: string;
}

export class MatchPairs<IsSlashGame extends boolean = false> extends EventEmitter {
  options: DeepRequired<MatchPairsConstructorOptions<IsSlashGame>>;
  message: MessageType<IsSlashGame>;
  emojis: string[];
  remainingPairs: number;
  components: ActionRowBuilder<ButtonBuilder>;
  selected: (Position & { id: number }) | null;
  tilesTurned: number;
  length: number;

  on(
    eventName: 'gameOver',
    listener: (result: { result: 'win' | 'lose'; player: User; tilesTurned: number; remainingPairs: number }) => void
  ): this;
  once(...args: Parameters<this['on']>): this;

  constructor(options: MatchPairsConstructorOptions<IsSlashGame>);

  sendMessage(
    content: string | MessagePayload | (IsSlashGame extends true ? InteractionEditReplyOptions : MessageEditOptions)
  ): Promise<Message>;
  startGame(): Promise<void>;
  getPairEmoji(emoji: string): (Position & { id: number })[];
  getComponent(): ActionRowBuilder<ButtonBuilder>;
  gameOver(msg: Message, result: boolean): Promise<Message>;
  handleButtons(msg: Message): Promise<void>;
}
