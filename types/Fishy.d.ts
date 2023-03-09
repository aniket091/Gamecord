import {
  ActionRowBuilder,
  ButtonBuilder,
  InteractionEditReplyOptions,
  Message,
  MessageEditOptions,
  MessagePayload,
  Snowflake,
} from 'discord.js';
import { EventEmitter } from 'node:events';
import { BaseConstructorOptions, DeepRequired, MessageType } from './Base';

export interface Fish {
  emoji: string;
  price: number;
}

export interface Fishes {
  junk: Fish;
  common: Fish;
  uncommon: Fish;
  rare: Fish;
}

// XXX: Someone suggest a better name, this name has a lot of ambiguity
export interface Player {
  id: Snowflake;
  balance: number;
  fishes: object;
}

export interface FishyConstructorOptions<IsSlashGame extends boolean> extends BaseConstructorOptions<IsSlashGame> {
  embed?: {
    title?: string;
    color?: string;
  };
  player?: Partial<Player>;
  fishes?: Partial<Fishes>;
  fishyRodPrice?: number;
  catchMessage?: string;
  sellMessage?: string;
  noBalanceMessage?: string;
  invalidTypeMessage?: string;
  invalidAmountMessage?: string;
  noItemMesaage?: string;
}

export class Fishy<IsSlashGame extends boolean = false> extends EventEmitter {
  options: DeepRequired<FishyConstructorOptions<IsSlashGame>>;
  message: MessageType<IsSlashGame>;
  player: Player;
  fishes: Fishes;

  constructor(options: FishyConstructorOptions<IsSlashGame>);

  sendMessage(
    content: string | MessagePayload | (IsSlashGame extends true ? InteractionEditReplyOptions : MessageEditOptions)
  ): Promise<Message>;
  catchFish(): Promise<Message>;
  sellFish(type: string, amount: number): Promise<Message>;
  fishyInventory(): Promise<Message>;
}
