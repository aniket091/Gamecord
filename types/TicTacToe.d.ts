import {
  ActionRowBuilder,
  ButtonBuilder,
  ChatInputCommandInteraction,
  InteractionEditReplyOptions,
  Message,
  MessageEditOptions,
  MessagePayload,
  User,
} from 'discord.js';
import { EventEmitter } from 'node:events';
import { BaseConstructorOptions, ButtonStyle } from './Base';

export type GameCellState = 0 | 1 | 2;

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
  tueMessage?: string;
  timeoutMessage?: string;
  requestMessage?: string;
  regectMessage?: string;
}

export class TicTacToe<IsSlashGame extends boolean = false> extends EventEmitter {
  options: TicTacToeConstructorOptions<IsSlashGame>;
  message: IsSlashGame extends true ? ChatInputCommandInteraction : Message;
  opponent: User;
  gameBoard: [
    GameCellState,
    GameCellState,
    GameCellState,
    GameCellState,
    GameCellState,
    GameCellState,
    GameCellState,
    GameCellState,
    GameCellState
  ];
  player1Turn: boolean;

  constructor(options: TicTacToeConstructorOptions<IsSlashGame>);

  sendMessage(
    content: string | MessagePayload | IsSlashGame extends true ? InteractionEditReplyOptions : MessageEditOptions
  ): Promise<Message>;
  startGame(): Promise<void>;
  TicTacToeGame(msg: Message): Promise<void>;
  handleButtons(msg: Message): void;
  gameOver(msg: Message, result: 'win' | 'tie' | 'timeout'): Promise<Message>;
  isGameOver(): boolean;
  hasWonGame(player: 1 | 2): boolean;
  getPlayerEmoji(): string;
  getTurnMessage(msg?: string): string;
  getButton(btn: GameCellState): { emoji: string; style: ButtonStyle };
  getComponents(): ActionRowBuilder<ButtonBuilder>;
}
