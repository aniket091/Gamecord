import {
  ActionRowBuilder,
  ButtonBuilder,
  InteractionEditReplyOptions,
  Message,
  MessageEditOptions,
  MessagePayload,
  User,
} from 'discord.js';
import { EventEmitter } from 'node:events';
import { BaseConstructorOptions, ButtonStyle, DeepRequired, MessageType } from './Base';

export interface TriviaConstructorOptions<IsSlashGame extends boolean> extends BaseConstructorOptions<IsSlashGame> {
  embed?: {
    title?: string;
    color?: string;
    description?: string;
  };
  mode?: 'single' | 'multiple';
  timeoutTime?: number;
  buttonStyle?: ButtonStyle;
  trueButtonStyle?: ButtonStyle;
  falseButtonStyle?: ButtonStyle;
  difficulty: 'easy' | 'medium' | 'hard';
  winMessage?: string;
  loseMessage?: string;
  errMessage?: string;
}

export class Trivia<IsSlashGame extends boolean = false> extends EventEmitter {
  options: DeepRequired<TriviaConstructorOptions<IsSlashGame>>;
  message: MessageType<IsSlashGame>;
  selected: string | number | null;
  trivia:
    | {}
    | {
        question: string;
        difficulty: string;
        category: string;
        answer: string;
        options: string[];
      };

  on(
    eventName: 'gameOver',
    listener: (result: {
      result: 'win' | 'lose';
      player: User;
      question: Trivia['trivia'];
      selected: string | number | null;
    }) => void
  ): this;
  once(...args: Parameters<this['on']>): this;

  constructor(options: TriviaConstructorOptions<IsSlashGame>);

  sendMessage(
    content: string | MessagePayload | (IsSlashGame extends true ? InteractionEditReplyOptions : MessageEditOptions)
  ): Promise<Message>;
  startGame(): Promise<void>;
  gameOver(msg: Message, result: boolean): Promise<Message>;
  getComponents(gameOver: boolean): [ActionRowBuilder<ButtonBuilder>];
  getTriviaQuestion(): Promise<false | undefined>;
}
