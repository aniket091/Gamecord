import {
  ActionRowBuilder,
  ButtonBuilder,
  InteractionEditReplyOptions,
  Message,
  MessageEditOptions,
  MessagePayload,
  User,
} from 'discord.js';
import { Approve, ApproveConstructorOptions } from './Approve';
import { BaseConstructorOptions, ButtonStyle, DeepRequired, MessageType, Tuple } from './Base';

export type TicTacToeGameCellState = 0 | 1 | 2;

export interface TicTacToeConstructorOptions<IsSlashGame extends boolean> extends BaseConstructorOptions<IsSlashGame> {
  opponent: User;
  embed?: {
    title?: string;
    statusTitle?: string;
    overTitle?: string;
    color?: string;
  };
  emojis?: {
    xButton?: string;
    oButton?: string;
    blankButton?: string;
  };
  timeoutTime?: number;
  xButtonStyle?: ButtonStyle;
  oButtonStyle?: ButtonStyle;
  turnMessage?: string;
  winMessage?: string;
  tieMessage?: string;
  timeoutMessage?: string;
  requestMessage?: string;
  rejectMessage?: string;
}

export class TicTacToe<IsSlashGame extends boolean = false> extends Approve {
  options: DeepRequired<ApproveConstructorOptions & TicTacToeConstructorOptions<IsSlashGame>>;
  message: MessageType<IsSlashGame>;
  opponent: User;
  gameBoard: Tuple<9, TicTacToeGameCellState>;
  player1Turn: boolean;

  on(
    eventName: 'gameOver',
    listener: (result: {
      result: 'win' | 'tie' | 'timeout';
      player: User;
      opponent: User;
      gameBoard: TicTacToe['gameBoard'];
    }) => void
  ): this;
  once(...args: Parameters<this['on']>): this;

  constructor(options: ApproveConstructorOptions & TicTacToeConstructorOptions<IsSlashGame>);

  sendMessage(
    content: string | MessagePayload | (IsSlashGame extends true ? InteractionEditReplyOptions : MessageEditOptions)
  ): Promise<Message>;
  startGame(): Promise<void>;
  TicTacToeGame(msg: Message): Promise<void>;
  handleButtons(msg: Message): void;
  gameOver(msg: Message, result: 'win' | 'tie' | 'timeout'): Promise<Message>;
  isGameOver(): boolean;
  hasWonGame(player: 1 | 2): boolean;
  getPlayerEmoji(): string;
  getTurnMessage(msg?: string): string;
  // The functiom argument name 'btn' should be changed to 'state' or something like this
  getButton(btn: TicTacToeGameCellState): { emoji: string; style: ButtonStyle };
  getComponents(): ActionRowBuilder<ButtonBuilder>[];
}
