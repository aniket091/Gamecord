import { InteractionEditReplyOptions, Message, MessageEditOptions, MessagePayload, User } from 'discord.js';
import { EventEmitter } from 'node:events';
import { BaseConstructorOptions, DeepRequired, MessageType } from './Base';

export interface FastTypeConstructorOptions<IsSlashGame extends boolean> extends BaseConstructorOptions<IsSlashGame> {
  embed?: {
    title?: string;
    color?: string;
    description?: string;
  };
  sentense?: string;
  timeoutTime?: number;
  winMessage?: string;
  loseMessage?: string;
}

export class FastType<IsSlashGame extends boolean = false> extends EventEmitter {
  options: DeepRequired<FastTypeConstructorOptions<IsSlashGame>>;
  message: MessageType<IsSlashGame>;
  timeTaken: number | null;
  wpm: number;

  on(
    eventName: 'gameOver',
    listener: (result: { result: 'win' | 'lose'; player: User; timeTaken: number; wpm: number }) => void
  ): this;
  once(...args: Parameters<this['on']>): this;

  constructor(options: FastTypeConstructorOptions<IsSlashGame>);

  sendMessage(
    content: string | MessagePayload | (IsSlashGame extends true ? InteractionEditReplyOptions : MessageEditOptions)
  ): Promise<Message>;
  startGame(): Promise<void>;
  gameOver(msg: Message, result: boolean): Promise<Message>;
}
