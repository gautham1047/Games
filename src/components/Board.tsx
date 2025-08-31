import React from "react";
import "../styles/Board.css";

type BoardProps = {
  squares: (string | null)[];
  onSquareClick: (index: number) => void;
  darkMode: boolean;
  winner: string | null;
  active: string | null;
};

const Board: React.FC<BoardProps> = ({
  squares,
  onSquareClick,
  darkMode,
  winner,
  active,
}) => {
  const boardClass = `board-container ${
    darkMode ? "board-dark" : "board-light"
  }`;
  const buttonClass = darkMode
    ? "btn btn-secondary"
    : "btn btn-outline-primary";

  // If winner exists, fill the board with winner's symbol
  const displaySquares = winner ? Array(9).fill(winner) : squares;

  return (
    <div className="d-flex justify-content-center">
      <div className={`${boardClass} ${active ?? ""}`}>
        <div className="row row-cols-3 g-2">
          {displaySquares.map((value, index) => (
            <div className="col" key={index}>
              <button
                className={`${buttonClass} cell-button`}
                onClick={() => onSquareClick(index)}
                disabled={!!value || !!winner} // disable clicks if square filled or if winner exists
              >
                {value}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Board;
