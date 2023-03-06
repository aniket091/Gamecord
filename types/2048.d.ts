import {
  AttachmentBuilder,
  InteractionEditReplyOptions,
  Message,
  MessageEditOptions,
  MessagePayload,
  User,
} from 'discord.js';
import { EventEmitter } from 'node:events';
import { BaseConstructorOptions, ButtonStyle, DeepRequired, MessageType, Position } from './Base';

export interface TwoZeroFourEightConstructorOptions<IsSlashGame extends boolean>
  extends BaseConstructorOptions<IsSlashGame> {
  embed?: {
    title?: string;
    color?: string;
  };
  emojis?: {
    up?: string;
    down?: string;
    left?: string;
    right?: string;
  };
  timeoutTime?: number;
  buttonStyle?: ButtonStyle;
}

export class TwoZeroFourEight<IsSlashGame extends boolean = false> extends EventEmitter {
  options: DeepRequired<TwoZeroFourEightConstructorOptions<IsSlashGame>>;
  message: MessageType<IsSlashGame>;
  gameBoard: string[];
  mergedPos: Position[];
  length: number;
  score: number;

  on(eventName: 'gameOver', listener: (result: { result: 'win' | 'lose'; player: User; score: number }) => void): this;
  once(...args: Parameters<this['on']>): this;

  constructor(options: TwoZeroFourEightConstructorOptions<IsSlashGame>);

  sendMessage(
    content: string | MessagePayload | (IsSlashGame extends true ? InteractionEditReplyOptions : MessageEditOptions)
  ): Promise<Message>;
  getBoardImage(): Promise<AttachmentBuilder>; // There is literally no reason to make this asynchronous
  startGame(): Promise<void>;
  placeRandomTile(): void;
  handleButtons(msg: Message): void;
  gameOver(msg: Message): Promise<Message>;
  isGameOver(): boolean;
  shiftVertical(dir: 'up' | 'down'): boolean;
  shiftHorizontal(dir: 'left' | 'right'): boolean;
  isInsideBlock(pos: Position): boolean;
  shift(pos: Position, dir: 'up' | 'down' | 'left' | 'right'): boolean;
}
