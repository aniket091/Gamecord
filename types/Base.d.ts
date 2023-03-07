import { ChatInputCommandInteraction, Message } from 'discord.js';

export type ButtonStyle = 'PRIMARY' | 'SECONDARY' | 'SUCCESS' | 'DANGER';

export interface Position {
  x: number;
  y: number;
}

export type MessageType<IsSlashGame extends boolean> = IsSlashGame extends true ? ChatInputCommandInteraction : Message;

export interface BaseConstructorOptions<IsSlashGame extends boolean> {
  isSlashGame?: IsSlashGame;
  message: MessageType<IsSlashGame>;
  playerOnlyMessage: string | false; // Wouldn't string | null be more natural?
}
