import { InteractionEditReplyOptions, Message, MessageEditOptions, MessagePayload, User } from 'discord.js';
import { Approve, ApproveConstructorOptions } from './Approve';
import { BaseConstructorOptions, ButtonStyle, DeepRequired, MessageType } from './Base';

export interface RockPaperScisdorsConstructorOptions<IsSlashGame extends boolean>
  extends BaseConstructorOptions<IsSlashGame> {
  opponent: User;
  embed?: {
    title?: string;
    color?: string;
    description?: string;
  };
  buttons: {
    rock?: string;
    paper?: string;
    scissors?: string;
  };
  emojis?: {
    rock?: string;
    paper?: string;
    scissors?: string;
  };
  timeoutTime?: number;
  buttonStyle?: ButtonStyle;
  pickMessage?: string;
  winMessage?: string;
  tieMessage?: string;
  timeoutMessage?: string;
  requestMessage?: string;
  rejectMessage?: string;
}

export class RockPaperScissors<IsSlashGame extends boolean = false> extends Approve {
  options: DeepRequired<ApproveConstructorOptions & RockPaperScisdorsConstructorOptions<IsSlashGame>>;
  message: MessageType<IsSlashGame>;
  opponent: User;
  playerPick: string | null;
  opponentPick: string | null;

  on(
    eventName: 'gameOver',
    listener: (result: {
      result: 'win' | 'tie' | 'timeout';
      player: User;
      opponent: User;
      playerPick: string | null;
      opponentPick: string | null;
    }) => void
  ): this;
  once(...args: Parameters<this['on']>): this;

  constructor(options: ApproveConstructorOptions & RockPaperScisdorsConstructorOptions<IsSlashGame>);

  sendMessage(
    content: string | MessagePayload | (IsSlashGame extends true ? InteractionEditReplyOptions : MessageEditOptions)
  ): Promise<Message>;
  startGame(): Promise<void>;
  RPSGame(msg: Message): Promise<void>;
  getResult(): 'win' | 'tie' | 'timeout';
  player1Won(): boolean;
  gameOver(msg: Message, result: 'win' | 'tie' | 'timeout'): Promise<Message>;
}
