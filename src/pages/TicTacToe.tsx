import React, { useState } from "react";
import Board from "../components/Board";
import "../styles/App.css";
import DarkModeToggle from "../components/DarkModeToggle";
import { useNavigate } from "react-router-dom";

const App: React.FC = () => {
  const [squares, setSquares] = useState<(string | null)[]>(
    Array(9).fill(null)
  );
  const [xIsNext, setXIsNext] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [showJoinField, setShowJoinField] = useState(false);
  const [serverCode, setServerCode] = useState("");
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isMultiplayer, setIsMultiplayer] = useState(false);
  const [playerSymbol, setPlayerSymbol] = useState<"X" | "O" | null>(null);

  const handleClick = (index: number) => {
    if (squares[index] || winner) return;

    if (isMultiplayer && socket && playerSymbol) {
      console.log("x is next", xIsNext);
      console.log("player symbol", playerSymbol);

      const isPlayerTurn =
        (playerSymbol === "X" && xIsNext) || (playerSymbol === "O" && !xIsNext);
      if (!isPlayerTurn) return;


      console.log("Sending move to server:", index);


      socket.send(
        JSON.stringify({ type: "move", index, symbol: playerSymbol })
      );
    } else {
      const nextSquares = squares.slice();
      nextSquares[index] = xIsNext ? "X" : "O";
      setSquares(nextSquares);
      setXIsNext(!xIsNext);
      setWinner(detectWinner(nextSquares));
    }
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

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const toggleBoardClear = () => {
    if (isMultiplayer && socket && playerSymbol) {
      socket.send(JSON.stringify({ type: "reset" }));
    } else {
      setSquares(Array(9).fill(null));
      setXIsNext(false);
      setWinner(null);
    }
  };

  const handleJoinServer = () => {
    toggleBoardClear();
    const ws = new WebSocket(`ws://${serverCode}`);

    ws.onopen = () => {
      console.log("Connected to server");
      ws.send(JSON.stringify({ type: "join", room: "room1", gameType: "tictactoe" }));
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);

      if (message.type === "joined") {
        console.log("Joined room:", message.room);
        setIsMultiplayer(true);
      }

      if (message.type === "startGame") {
        console.log("Game started! You are:", message.player);
        setPlayerSymbol(message.player); // message.player will be "X" or "O"
      }

      if (message.type === "updateBoard") {
        console.log("board updated")
        setSquares(message.squares);
        setXIsNext(message.xIsNext);
        setWinner(message.winner);
      }

      if (message.type == "boardClear") {
        setSquares(Array(9).fill(null));
        setXIsNext(false);
        setWinner(null);
      }
    };

    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
    };

    setSocket(ws);
  };

  const appClass = darkMode ? "app-dark" : "app-light";
  const defaultBtnClass = `btn ${
    darkMode ? "btn-outline-light" : "btn-outline-dark"
  } default-btn`;

  let isActive: "active" | "inactive" | null =
    isMultiplayer &&
    playerSymbol &&
    ((playerSymbol === "X" && xIsNext) || (playerSymbol === "O" && !xIsNext))
      ? "active"
      : "inactive";

  if (winner && isMultiplayer && playerSymbol) {
    isActive = winner === playerSymbol ? "active" : "inactive";
  }

  if (!isMultiplayer || !playerSymbol) {
    isActive = null;
  }

  const navigate = useNavigate();

  return (
    <div className={appClass}>
      <div className="container py-4 position-relative d-flex flex-column align-items-center">
        <div className="position-absolute" style={{ top: "1rem", right: "1rem" }}>
          <DarkModeToggle darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
        </div>

        <h2 className="text-center mb-4">Tic Tac Toe</h2>

        <Board
          squares={squares}
          onSquareClick={handleClick}
          darkMode={darkMode}
          winner={winner}
          active={isActive}
        />

        <button
          className={`${defaultBtnClass} mt-4`}
          onClick={toggleBoardClear}
        >
          Clear Board
        </button>

        {!showJoinField ? (
          <button
            className={`${defaultBtnClass} mt-3`}
            onClick={() => setShowJoinField(true)}
          >
            Join Multiplayer Server
          </button>
        ) : (
          <div className="mt-3 d-flex flex-column align-items-center">
            <input
              type="text"
              value={serverCode}
              onChange={(e) => setServerCode(e.target.value)}
              placeholder="Enter server address"
              className="form-control mb-2"
              style={{ width: "250px" }}
            />
            <button className={defaultBtnClass} onClick={handleJoinServer}>
              Connect
            </button>
          </div>
        )}

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

export default App;
