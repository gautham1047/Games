export interface Piece {
  type: "pawn" | "rook" | "knight" | "bishop" | "queen" | "king";
  color: "w" | "b";
  position: [number, number];
}

export type Board = (Piece | null)[][];