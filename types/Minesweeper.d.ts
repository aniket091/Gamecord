import {
  ActionRowBuilder,
  ButtonBuilder,
  InteractionEditReplyOptions,
  Message,
  MessageEditOptions,
  MessagePayload,
} from 'discord.js';
import { EventEmitter } from 'node:events';
import { BaseConstructorOptions, DeepRequired, MessageType } from './Base';

export interface MinesweeperConstructorOptions<IsSlashGame extends boolean>
  extends BaseConstructorOptions<IsSlashGame> {
  embed?: {
    title?: string;
    color?: string;
    description?: string;
  };
  emojis?: {
    flag?: string;
    mine?: string;
  };
  mines?: number;
  timeoutTime?: number;
  winMessage?: string;
  loseMessage?: string;
}

export class Minesweeper<IsSlashGame extends boolean = false> extends EventEmitter {
  options: DeepRequired<MinesweeperConstructorOptions<IsSlashGame>>;
  message: MessageType<IsSlashGame>;
  pokemon: Pokemon;

  constructor(options: MinesweeperConstructorOptions<IsSlashGame>);

  sendMessage(
    content: string | MessagePayload | (IsSlashGame extends true ? InteractionEditReplyOptions : MessageEditOptions)
  ): Promise<Message>;
  startGame(): Promise<void>;
  handleButtons(msg: Message): void;
  gameOver(msg: Message, result: boolean): Promise<Message>;
  plantMines(): void;
  getMinesAround(x: number, y: number): number;
  showFirstBlock(): void;
  foundAllMines(): boolean;
  getComponents(showMines: boolean, found: boolean): ActionRowBuilder<ButtonBuilder>[];
}
