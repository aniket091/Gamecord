import { InteractionEditReplyOptions, Message, MessageEditOptions, MessagePayload, User } from 'discord.js';
import { EventEmitter } from 'node:events';
import { BaseConstructorOptions, ButtonStyle, DeepRequired, MessageType } from './Base';

export interface WouldYouRatherConstructorOptions<IsSlashGame extends boolean>
  extends BaseConstructorOptions<IsSlashGame> {
  embed?: {
    title?: string;
    color?: string;
  };
  buttons?: {
    option1?: string;
    option2?: string;
  };
  errMessage?: string;
  buttonStyle?: ButtonStyle;
}

export interface WouldYouRatherData {
  title: string;
  author: string;
  option1: string;
  option2: string;
  option1_votes: string;
  option2_votes: string;
}

export class WouldYouRather<IsSlashGame extends boolean = false> extends EventEmitter {
  options: DeepRequired<WouldYouRatherConstructorOptions<IsSlashGame>>;
  message: MessageType<IsSlashGame>;
  data: WouldYouRatherData | {} | null;

  on(
    eventName: 'gameOver',
    listener: (result: { result: 'finish'; player: User; question: WouldYouRatherData; selected: string }) => void
  ): this;
  once(...args: Parameters<this['on']>): this;

  constructor(options: WouldYouRatherConstructorOptions<IsSlashGame>);

  sendMessage(
    content: string | MessagePayload | (IsSlashGame extends true ? InteractionEditReplyOptions : MessageEditOptions)
  ): Promise<Message>;
  getWyrQuestion(): Promise<WouldYouRather | {}>;
  startGame(): Promise<void>;
  gameOver(msg: Message, result: '1' | '2'): Promise<Message>;
}
