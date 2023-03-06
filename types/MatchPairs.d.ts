import {
  ActionRowBuilder,
  ButtonBuilder,
  ChatInputCommandInteraction,
  InteractionEditReplyOptions,
  Message,
  MessageEditOptions,
  MessagePayload,
} from 'discord.js';
import { EventEmitter } from 'node:events';
import { BaseConstructorOptions, Position } from './Base';

export interface MatchPairsConstructorOptions<IsSlashGame extends boolean> extends BaseConstructorOptions<IsSlashGame> {
  embed?: { title?: string; color?: string; description?: string };
  timeoutTime?: number;
  emojis?: string[];
  winMessage?: string;
  loseMessage?: string;
}

export class MatchPairs<IsSlashGame extends boolean = false> extends EventEmitter {
  options: MatchPairsConstructorOptions<IsSlashGame>;
  message: IsSlashGame extends true ? ChatInputCommandInteraction : Message;
  emojis: string[];
  remainingPairs: number;
  components: ActionRowBuilder<ButtonBuilder>;
  selected: (Position & { id: number }) | null;
  tilesTurned: number;
  length: number;

  constructor(options: MatchPairsConstructorOptions<IsSlashGame>);

  sendMessage(
    content: string | MessagePayload | IsSlashGame extends true ? InteractionEditReplyOptions : MessageEditOptions
  ): Promise<Message>;
  startGame(): Promise<void>;
  getPairEmoji(emoji: string): (Position & { id: number })[];
  getComponent(): ActionRowBuilder<ButtonBuilder>;
  gameOver(msg: Message, result: boolean): Promise<Message>;
  handleButtons(msg: Message): Promise<void>;
}
