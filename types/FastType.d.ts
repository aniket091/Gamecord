import { InteractionEditReplyOptions, Message, MessageEditOptions, MessagePayload } from 'discord.js';
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

  constructor(options: FastTypeConstructorOptions<IsSlashGame>);

  sendMessage(
    content: string | MessagePayload | (IsSlashGame extends true ? InteractionEditReplyOptions : MessageEditOptions)
  ): Promise<Message>;
  startGame(): Promise<void>;
  gameOver(msg: Message, result: boolean): Promise<Message>;
}
