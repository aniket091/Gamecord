import { InteractionEditReplyOptions, Message, MessageEditOptions, MessagePayload, User } from 'discord.js';
import { EventEmitter } from 'node:events';
import { BaseConstructorOptions, ButtonStyle, DeepRequired, MessageType } from './Base';

export interface FloodConstructorOptions<IsSlashGame extends boolean> extends BaseConstructorOptions<IsSlashGame> {
  embed?: {
    title?: string;
    color?: string;
  };
  difficulty?: number;
  timeoutTime?: number;
  buttonStyle?: ButtonStyle;
  winMessage?: string;
  loseMessage?: string;
  emojis?: string[];
}

export class Flood<IsSlashGame extends boolean = false> extends EventEmitter {
  options: DeepRequired<FloodConstructorOptions<IsSlashGame>>;
  message: MessageType<IsSlashGame>;
  length: number;
  gameBoard: string[];
  maxTurns: number;
  turns: number;

  on(
    eventName: 'gameOver',
    listener: (result: {
      result: 'win' | 'lose';
      player: User;
      turns: number;
      maxTurns: number;
      boardColor: string;
    }) => void
  ): this;
  once(...args: Parameters<this['on']>): this;

  constructor(options: FloodConstructorOptions<IsSlashGame>);

  getBoardContent(): string;
  sendMessage(
    content: string | MessagePayload | (IsSlashGame extends true ? InteractionEditReplyOptions : MessageEditOptions)
  ): Promise<Message>;
  startGame(): Promise<void>;
  gameOver(msg: Message, result: boolean): Promise<Message>;
  updateGame(selected: string, msg: Message): Promise<boolean | undefined>;
}
