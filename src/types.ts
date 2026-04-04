export type Player = 'red' | 'black';

export interface Piece {
  player: Player;
  king: boolean;
}

export type Board = (Piece | null)[][];

export interface Position {
  row: number;
  col: number;
}

export interface Move {
  from: Position;
  to: Position;
  captures: Position[];
}

export type GameStatus = 'playing' | 'red_wins' | 'black_wins';
