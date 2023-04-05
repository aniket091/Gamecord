import { Message, User } from 'discord.js';
import { EventEmitter } from 'node:events';
import { DeepRequired, MessageType } from './Base';

export interface ApproveConstructorOptions {
  embed?: {
    requestTitle?: string;
    requestColor?: string;
    rejectTitle?: string;
    rejectColor?: string;
  };
  buttons?: {
    accept?: string;
    reject?: string;
  };
  reqTimeoutTime?: number;
  mentionUser?: boolean;
  requestMessage?: string;
  rejectMessage?: string;
  reqTimeoutMessage?: string;
}

export class Approve extends EventEmitter {
  options: DeepRequired<ApproveConstructorOptions>;
  message: MessageType<boolean>;
  opponent: User;

  constructor(options: ApproveConstructorOptions);
  approve(): Promise<Message | false>;
  formatTurnMessage<Options extends object>(options: Options, contentMsg: keyof Options): string;
}
