import React from "react";
import "../styles/ChessBoard.css";
import type { Board, Piece } from "../assets/chess";
import { chessPieces } from "../assets/chessPieces";

interface ChessBoardProps {
  board: Board;
  selected: [number, number] | null;
  onSquareClick?: (row: number, col: number) => void;
  activeSquares: [number, number][];
  darkMode: boolean;
}

const ChessBoard: React.FC<ChessBoardProps> = ({ board, selected, onSquareClick, activeSquares, darkMode }) => {
  const renderSquares = () => {
    const squares = [];
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const isLightSquare = (i + j) % 2 !== 0;
        const piece: Piece | null = board[i]?.[j];
        let pieceImage = null;
        if (piece) {
          const pieceName = `${piece.type}_${piece.color}`;
          pieceImage = <img src={chessPieces[pieceName as keyof typeof chessPieces]} alt={pieceName} />;
        }

        squares.push(
          <div
            key={`${i}-${j}`}
            className={`chess-square ${isLightSquare ? "light" : "dark"} 
            ${darkMode ? "theme-dark" : "theme-light"}
            ${selected && selected[0] === i && selected[1] === j ? "selected" : ""} 
            ${activeSquares.some(([r, c]) => r === i && c === j) ? "active" : ""}`}
            onClick={() => onSquareClick && onSquareClick(i, j)}
          >
            {pieceImage}
          </div>
        );
      }
    }
    return squares;
  };

  return <div className="chess-board">{renderSquares()}</div>;
};

export default ChessBoard;