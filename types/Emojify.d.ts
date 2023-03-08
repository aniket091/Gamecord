type CharsKeys =
  | '0'
  | '1'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | '#'
  | '*'
  | '?'
  | '!'
  | '+'
  | '-'
  | '×'
  | '$'
  | '/'
  | ' ';

export const Emojity: {
  (content: string): string;
  chars: Record<CharsKeys, string>;
};
