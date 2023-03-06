import { ChatInputCommandInteraction, Message } from 'discord.js';

export type ButtonStyle = 'PRIMARY' | 'SECONDARY' | 'SUCCESS' | 'DANGER';

export interface Position {
  x: number;
  y: number;
}

export interface BaseConstructorOptions<IsSlashGame extends boolean> {
  isSlashGame?: IsSlashGame;
  message: IsSlashGame extends true ? ChatInputCommandInteraction : Message;
  playerOnlyMessage: string | false; // Wouldn't string | null be more natural?
}
