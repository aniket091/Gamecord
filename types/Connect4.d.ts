import { InteractionEditReplyOptions, Message, MessageEditOptions, MessagePayload, User } from 'discord.js';
import { Approve, ApproveConstructorOptions } from './Approve';
import { BaseConstructorOptions, ButtonStyle, DeepRequired, MessageType } from './Base';

export interface Connect4ConstructorOptions<IsSlashGame extends boolean> extends BaseConstructorOptions<IsSlashGame> {
  opponent: User;
  embed?: {
    title?: string;
    statusTitle?: string;
    color?: string;
  };
  emojis?: {
    board?: string;
    player1?: string;
    player2?: string;
  };
  timeoutTime?: number;
  buttonStyle?: ButtonStyle;
  turnMessage?: string;
  winMessage?: string;
  tieMessage?: string;
  timeoutMessage?: string;
  requestMessage?: string;
  rejectMessage?: string;
}

export class Connect4<IsSlashGame extends boolean = false> extends Approve {
  options: DeepRequired<ApproveConstructorOptions & Connect4ConstructorOptions<IsSlashGame>>;
  message: MessageType<IsSlashGame>;
  opponent: User;
  player1Turn: boolean;
  gameBoard: string[];

  on(
    eventName: 'gameOver',
    listener: (result: { result: 'win' | 'tie' | 'timeout'; player: User; opponent: User }) => void
  ): this;
  once(...args: Parameters<this['on']>): this;

  constructor(options: ApproveConstructorOptions & Connect4ConstructorOptions<IsSlashGame>);

  getBoardContent(): string;
  sendMessage(
    content: string | MessagePayload | (IsSlashGame extends true ? InteractionEditReplyOptions : MessageEditOptions)
  ): Promise<Message>;
  startGame(): Promise<void>;
  connect4Game(msg: Message): Promise<void>;
  handleButtons(msg: Message): void;
  gameOver(msg: Message, result: 'win' | 'tie' | 'timeout'): Promise<Message>;
  getPlayerEmoji(): string;
  getTurnMessage(msg?: string): string;
  isBoardFull(): boolean;
  foundCheck(blockX: number, blockY: number): boolean;
}
