import React, { useState } from "react";
import Board from "../components/Board";
import "../styles/App.css";
import "../styles/Ultimate.css";
import DarkModeToggle from "../components/DarkModeToggle";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

const Ultimate = () => {
  const [allSquares, setAllSquares] = useState<(string | null)[][]>(
    Array.from({ length: 9 }, () => Array(9).fill(null))
  );
  const [xIsNext, setXIsNext] = useState(true);
  const [activeSquare, setActiveSquare] = useState<number | null>(null);
  const [fullSquares, setFullSquares] = useState<(string | null)[]>(
    Array(9).fill(null)
  );

  const { darkMode } = useTheme();

  const toggleBoardClear = () => {
    setAllSquares(Array.from({ length: 9 }, () => Array(9).fill(null))); // ✅ fresh arrays
    setXIsNext(false);
    setFullSquares(Array(9).fill(null));
    setActiveSquare(null);
  };

  const handleClick = (boardIndex: number, squareIndex: number) => {
    // If the board is not the active one (and it's not the very first move), do nothing
    if (activeSquare !== null && activeSquare !== boardIndex) return;
    // If there's an overall winner, do nothing

    // If the specific square or the entire board is already won, do nothing
    if (allSquares[boardIndex][squareIndex] || fullSquares[boardIndex]) return;

    // Create a new copy of the squares
    const newAllSquares = allSquares.map((inner) => inner.slice());

    // Place the new mark
    newAllSquares[boardIndex][squareIndex] = xIsNext ? "X" : "O";
    setAllSquares(newAllSquares);

    // Check if this move wins the small board
    const winner = detectWinner(newAllSquares[boardIndex]);
    if (winner) {
      const newFullSquares = fullSquares.slice();
      newFullSquares[boardIndex] = winner;
      setFullSquares(newFullSquares);

      // Check for overall winner
      const gameWinner = detectWinner(newFullSquares);
      if (gameWinner) {
        setFullSquares(Array(9).fill(gameWinner));
      }
    }

    // Determine the next active board
    // If the next board is already won/full, the next player can play anywhere
    if (
      fullSquares[squareIndex] ||
      newAllSquares[squareIndex].every((s) => s !== null)
    ) {
      setActiveSquare(null); // Player can choose any open board
    } else {
      setActiveSquare(squareIndex);
    }
    setXIsNext(!xIsNext);
  };

  const detectWinner = (squares: (string | null)[]): string | null => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8], // rows
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8], // cols
      [0, 4, 8],
      [2, 4, 6], // diags
    ];

    for (const [a, b, c] of lines) {
      if (
        squares[a] &&
        squares[a] === squares[b] &&
        squares[a] === squares[c]
      ) {
        return squares[a];
      }
    }
    return null;
  };

  const defaultBtnClass = `btn ${
    darkMode ? "btn-outline-light" : "btn-outline-dark"
  } default-btn`;

  const navigate = useNavigate();

  return (
    <div className={darkMode ? "app-dark" : "app-light"} style={{ height: "100vh", overflowY: "auto" }}>
      <div
        className="container py-4 position-relative d-flex flex-column align-items-center"
        style={{ minHeight: "100%" }}
      >
        <div
          className="position-absolute"
          style={{ top: "1rem", right: "1rem" }}
        >
          <DarkModeToggle />
        </div>

        <h2 className="text-center mb-4">Ultimate Tic Tac Toe</h2>

        <div className="boards-grid">
          {allSquares.map((boardSquares, index) => (
            <div className="board-wrapper" key={index}>
              <Board
                squares={boardSquares}
                onSquareClick={(squareIndex) => handleClick(index, squareIndex)}
                darkMode={darkMode}
                winner={fullSquares[index]}
                active={
                  activeSquare === null || activeSquare === index
                    ? "active"
                    : "inactive"
                }
              />
            </div>
          ))}
        </div>

        <button
          className={`${defaultBtnClass} mt-4`}
          onClick={toggleBoardClear}
        >
          Clear Board
        </button>

        <button
          className={`${defaultBtnClass} mt-4`}
          onClick={() => navigate("/home")}
        >
          Go Home
        </button>
      </div>
    </div>
  );
};

export default Ultimate;
