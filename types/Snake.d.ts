import { InteractionEditReplyOptions, Message, MessageEditOptions, MessagePayload, User } from 'discord.js';
import { EventEmitter } from 'node:events';
import { BaseConstructorOptions, DeepRequired, MessageType, Position } from './Base';

export interface SnakeConstructorOptions<IsSlashGame extends boolean> extends BaseConstructorOptions<IsSlashGame> {
  embed?: {
    title?: string;
    color?: string;
    overTitle?: string;
  };
  snake?: {
    head?: string;
    body?: string;
    tail?: string;
    skull?: string;
  };
  emojis?: {
    board?: string;
    food?: string;

    up?: string;
    down?: string;
    left?: string;
    right?: string;
  };
  foods?: string[];
  stopButton?: string;
  timeoutTime?: number;
}

export class Snake<IsSlashGame extends boolean = false> extends EventEmitter {
  options: DeepRequired<SnakeConstructorOptions<IsSlashGame>>;
  message: MessageType<IsSlashGame>;
  snake: Position[];
  apple: Position;
  snakeLength: number;
  gameBoard: string[];
  score: number;

  on(eventName: 'gameOver', listener: (result: { result: 'win' | 'lose'; player: User; score: number }) => void): this;
  once(...args: Parameters<this['on']>): this;

  constructor(options: SnakeConstructorOptions<IsSlashGame>);

  getBoardContent(isSkull: boolean): string;
  isSnake(pos: Position): Position | false; // I think this should be boolean type in the src
  updateFoodLoc(): void;
  sendMessage(
    content: string | MessagePayload | (IsSlashGame extends true ? InteractionEditReplyOptions : MessageEditOptions)
  ): Promise<Message>;
  startGame(): Promise<void>;
  updateGame(msg: Message): Promise<Message>;
  gameOver(msg: Message): Promise<Message>;
  handleButtons(msg: Message): void;
}
