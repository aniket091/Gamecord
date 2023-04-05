import { ChatInputCommandInteraction, Message } from 'discord.js';

// Helper type
export type DeepRequired<T> = T extends object ? { [K in keyof T]-?: DeepRequired<T[K]> } : T;
export type Tuple<N extends number, T> = N extends N ? (number extends N ? T[] : _TupleOf<T, N, []>) : never;
type _TupleOf<T, N extends number, R extends unknown[]> = R['length'] extends N ? R : _TupleOf<T, N, [T, ...R]>;

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
