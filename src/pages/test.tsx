import { useState } from "react";
import Board from "../components/Board";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import GameUI from "../components/gameUI";
import type { Button, Indicator } from "../components/gameUI";
import "../styles/Test.css";

const test = () => {
  const [squares, setSquares] = useState<(string | null)[]>(
    Array(9).fill(null)
  );
  const [xIsNext, setXIsNext] = useState(true);
  const [winner, setWinner] = useState<string | null>(null);
  const [showMultiplayerConnectUI, setShowMultiplayerConnectUI] = useState(false); // New state for multiplayer UI visibility
  const [serverCode, setServerCode] = useState("");
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isMultiplayer, setIsMultiplayer] = useState(false);
  const [playerSymbol, setPlayerSymbol] = useState<"X" | "O" | null>(null);

  const { darkMode } = useTheme();

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
      ws.send(
        JSON.stringify({ type: "join", room: "room1", gameType: "tictactoe" })
      );
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
        console.log("board updated");
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

  const gameIndicators: Indicator[] = [
    {
      label: winner ? `Winner` : `Next`,
      value: winner ? `${winner}` : `${xIsNext ? "X" : "O"}`,
    },
  ];

  const toggleMultiplayerConnectUI = () => {
    setShowMultiplayerConnectUI((prev) => !prev);
    // Optionally reset serverCode if the UI is being hidden
    if (showMultiplayerConnectUI) {
      setServerCode("");
    }
  };
  const gameButtons: Button[] = [
    {
      text: "Clear Board",
      onClick: toggleBoardClear,
      className: darkMode ? "btn-warning" : "btn-orange",
    },
    {
      text: "Go Home",
      onClick: () => navigate("/home"),
      className: darkMode ? "btn-outline-light" : "btn-brown",
    },
    {
      text: showMultiplayerConnectUI ? "Hide Multiplayer" : "Join Multiplayer",
      onClick: toggleMultiplayerConnectUI,
      className: darkMode ? "btn-info" : "btn-primary", // Example styling
    },
  ];

  const multiplayerConnectUI = showMultiplayerConnectUI ? (
    <div className="multiplayer-connect-ui mt-3">
      <input
        type="text"
        className={`form-control mb-2 ${darkMode ? "bg-dark text-light border-secondary" : ""}`}
        placeholder="Server Code (e.g., localhost:8080)"
        value={serverCode}
        onChange={(e) => setServerCode(e.target.value)}
      />
      <button
        onClick={handleJoinServer}
        className={`btn ${darkMode ? "btn-success" : "btn-primary"}`}
        disabled={!serverCode} // Disable if serverCode is empty
      >
        Connect to Server
      </button>
    </div>
  ) : null;

  const isLandscape =
    document.documentElement.clientWidth >= document.documentElement.clientHeight;

  return (
    <div
      className={`test-page-container${darkMode ? " dark" : ""}`}
    >
      <div className="test-board-container">
        <Board
          squares={squares}
          onSquareClick={handleClick}
          darkMode={darkMode}
          winner={winner}
          active={isActive}
        />
      </div>
      <GameUI
        title="Tic-Tac-Toe"
        indicators={gameIndicators}
        buttons={gameButtons}
        additionalContent={multiplayerConnectUI}
      />
    </div>
  );
}

export default test;
