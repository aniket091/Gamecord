import { InteractionEditReplyOptions, Message, MessageEditOptions, MessagePayload, Snowflake, User } from 'discord.js';
import { EventEmitter } from 'node:events';
import { BaseConstructorOptions, DeepRequired, MessageType } from './Base';

export interface Fish {
  emoji: string;
  price: number;
}

export type Fishes = Record<'junk' | 'common' | 'uncommon' | 'rare', Fish>;

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

  on(
    eventName: 'catchFish' | 'sellFish',
    listener: (fishy: { player: User; fishType: keyof Fishes; fish: Fish }) => void
  ): this;
  once(...args: Parameters<this['on']>): this;

  constructor(options: FishyConstructorOptions<IsSlashGame>);

  sendMessage(
    content: string | MessagePayload | (IsSlashGame extends true ? InteractionEditReplyOptions : MessageEditOptions)
  ): Promise<Message>;
  catchFish(): Promise<Message>;
  sellFish(type: string, amount: number): Promise<Message>;
  fishyInventory(): Promise<Message>;
}
