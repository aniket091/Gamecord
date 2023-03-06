import { InteractionEditReplyOptions, Message, MessageEditOptions, MessagePayload, User } from 'discord.js';
import { EventEmitter } from 'node:events';
import { BaseConstructorOptions, DeepRequired, MessageType } from './Base';

export interface Pokemon {
  name: string;
  id: number;
  types: string[];
  abilities: string[];
  height: number;
  width: number;
  answerImage: string;
  questionImage: string;
}

export interface GuessThePokemonConstructorOptions<IsSlashGame extends boolean>
  extends BaseConstructorOptions<IsSlashGame> {
  embed?: {
    title?: string;
    color?: string;
  };
  timeoutTime?: number;
  winMessage?: string;
  loseMessage?: string;
  errMessage?: string;
}

export class GuessThePokemon<IsSlashGame extends boolean = false> extends EventEmitter {
  options: DeepRequired<GuessThePokemonConstructorOptions<IsSlashGame>>;
  message: MessageType<IsSlashGame>;
  pokemon: Pokemon;

  on(
    eventName: 'gameOver',
    listener: (result: { result: 'win' | 'lose'; player: User; pokemon: Pokemon }) => void
  ): this;
  once(...args: Parameters<this['on']>): this;

  constructor(options: GuessThePokemonConstructorOptions<IsSlashGame>);

  sendMessage(
    content: string | MessagePayload | (IsSlashGame extends true ? InteractionEditReplyOptions : MessageEditOptions)
  ): Promise<Message>;
  startGame(): Promise<void>;
  gameOver(msg: Message, result: boolean): Promise<Message>;
}
