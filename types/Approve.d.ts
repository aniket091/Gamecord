import { Message } from 'discord.js';
import { EventEmitter } from 'node:events';

// this isnt comolete yet
export class Approve<Options extends object> extends EventEmitter {
  approve(): Promise<Message | false>;
  formatTurnMessage(options: Options, contentMsg: string): string;
}
