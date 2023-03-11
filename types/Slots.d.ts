import { InteractionEditReplyOptions, Message, MessageEditOptions, MessagePayload } from 'discord.js';
import { EventEmitter } from 'node:events';
import { BaseConstructorOptions, DeepRequired, MessageType } from './Base';

export interface SlotsConstructorOptions<IsSlashGame extends boolean> extends BaseConstructorOptions<IsSlashGame> {
  embed?: {
    title?: string;
    color?: string;
  };
  slots: string[];
}

export class Slots<IsSlashGame extends boolean = false> extends EventEmitter {
  options: DeepRequired<SlotsConstructorOptions<IsSlashGame>>;
  message: MessageType<IsSlashGame>;
  slot1: number;
  slot2: number;
  slot3: number;
  slots: string[];
  result: null;

  constructor(options: SlotsConstructorOptions<IsSlashGame>);

  getBoardContent(showResult: boolean): string;
  sendMessage(
    content: string | MessagePayload | (IsSlashGame extends true ? InteractionEditReplyOptions : MessageEditOptions)
  ): Promise<Message>;
  startGame(): Promise<void>;
  gameOver(msg: Message): Promise<Message>;
  slotMachine(): void;
  hasWon(): boolean;
  wrap(s: number, add: boolean): string;
}
