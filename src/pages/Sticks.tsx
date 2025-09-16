import { useState } from "react";
import Hands from "../components/Hands";
import DarkModeToggle from "../components/DarkModeToggle";
import "../styles/Sticks.css";
import { useNavigate } from "react-router-dom";

const Sticks = () => {
  const [players, setPlayers] = useState({
    top: { left: 1, right: 1 },
    bottom: { left: 1, right: 1 },
  });
  const [base, setBase] = useState(5);
  const [useBase, setUseBase] = useState(false);
  const [leftMult, setLeftMult] = useState(false);
  const [rightMult, setRightMult] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // 0 = inactive, -1 = left active, 1 = right active
  const [currentPlayer, setCurrentPlayer] = useState<"top" | "bottom">(
    "bottom"
  );
  const [selectedHand, setSelectedHand] = useState<"left" | "right" | null>(
    null
  );

  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<"top" | "bottom" | null>(null);

  const [originalState, setOriginalState] = useState([1, 1]);
  const [exchangeOccuring, setExchangeOccuring] = useState<
    "top" | "bottom" | null
  >(null);

  const [showJoinField, setShowJoinField] = useState(false);
  const [serverCode, setServerCode] = useState("");
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isMultiplayer, setIsMultiplayer] = useState(false);
  const [playerSymbol, setPlayerSymbol] = useState<"top" | "bottom" | null>(null);

  const navigate = useNavigate();

  const setPlayerHand = (
    player: "top" | "bottom",
    hand: "left" | "right",
    value: number
  ) => {
    setPlayers((prev) => ({
      ...prev,
      [player]: {
        ...prev[player],
        [hand]: value,
      },
    }));
  };

  const handleHandClick = (
    player: "top" | "bottom",
    hand: "left" | "right"
  ) => {
    // handle multiplayer logic
    if (isMultiplayer && socket && playerSymbol) {
      const isPlayerTurn = (playerSymbol === currentPlayer);
      if (!isPlayerTurn) return;

      // if (playerSymbol === "top") {
      //   player = (player === "top") ? "bottom" : "top";
      // }

      socket.send(
        JSON.stringify({
          type: "move",
          move: {
            player: player,
            hand,
            selectedHand,
            exchangeOccuring,
            originalState,
          },
        })
      );
      return; // Don't process locally
    }

    if (player === currentPlayer && selectedHand === null) {
      // select hand
      const isLeft = hand === "left";
      const shouldMultiply = (isLeft && leftMult) || (!isLeft && rightMult);
      if (players[currentPlayer][hand] == 0) return;
      if (players[currentPlayer][hand] == 1 && shouldMultiply) return;

      setSelectedHand(hand);
      setOriginalState([
        players[currentPlayer]["left"],
        players[currentPlayer]["right"],
      ]);
    } else if (player !== currentPlayer && selectedHand !== null) {
      // attack
      if (exchangeOccuring) return;

      const sourceValue = players[currentPlayer][selectedHand];
      const targetValue = players[player][hand];

      const isLeft = selectedHand === "left";
      const shouldMultiply = (isLeft && leftMult) || (!isLeft && rightMult);

      let newValue = shouldMultiply
        ? sourceValue * targetValue
        : sourceValue + targetValue;

      if (newValue >= base) {
        if (useBase) newValue %= base;
        else newValue = 0;
      }

      // Manually compute what the opponent's hands would be
      const updatedOpponentHands = {
        ...players[player],
        [hand]: newValue,
      };

      // Check if both hands are zero
      if (Object.values(updatedOpponentHands).every((val) => val === 0)) {
        setPlayerHand(player, hand, newValue); // still update state
        setSelectedHand(null);
        setWinner(currentPlayer);
        setGameOver(true);
        return;
      }

      // continue normal flow
      setPlayerHand(player, hand, newValue);
      setSelectedHand(null);
      setCurrentPlayer(player);
    } else if (player === currentPlayer && selectedHand !== null) {
      // exchange logic
      if (hand === selectedHand) {
        const otherHand = hand === "left" ? "right" : "left";

        // prevent negative fingers
        if (players[currentPlayer][otherHand] === 0) return;

        setPlayerHand(
          currentPlayer,
          selectedHand,
          players[currentPlayer][selectedHand] + 1
        );
        setPlayerHand(
          currentPlayer,
          otherHand,
          players[currentPlayer][otherHand] - 1
        );
        setExchangeOccuring(currentPlayer);
        return;
      }

      const selectedValue = players[currentPlayer][selectedHand];
      const targetValue = players[currentPlayer][hand];

      const newSelectedValue =
        hand === selectedHand ? selectedValue + 1 : selectedValue - 1;
      const newTargetValue =
        hand === selectedHand ? targetValue - 1 : targetValue + 1;

      // cancel exchange if any hand would go invalid
      if (
        newSelectedValue < 0 ||
        newTargetValue < 0 ||
        newSelectedValue > base - 1 ||
        newTargetValue > base - 1
      ) {
        setPlayerHand(currentPlayer, "left", originalState[0]);
        setPlayerHand(currentPlayer, "right", originalState[1]);
        setSelectedHand(null);
        setExchangeOccuring(null);
        return;
      }

      setPlayerHand(
        currentPlayer,
        selectedHand,
        players[currentPlayer][selectedHand] - 1
      );
      setPlayerHand(currentPlayer, hand, players[currentPlayer][hand] + 1);
      setExchangeOccuring(currentPlayer);
    }
  };

  const resetGame = () => {
    if (isMultiplayer && socket && playerSymbol) {
      socket.send(JSON.stringify({ type: "reset" }));
      return; // don't process locally
    }
    
    setPlayers({
      top: { left: 1, right: 1 },
      bottom: { left: 1, right: 1 },
    });
    setSelectedHand(null);
    setCurrentPlayer("bottom");
    setGameOver(false);
    setWinner(null);
  };

  const handleConfirmSwitch = () => {
    setSelectedHand(null);
    setExchangeOccuring(null);
    setCurrentPlayer((prev) => (prev === "top" ? "bottom" : "top"));
  };

  // Reusable toggle button for booleans, updated for dark mode
  const ToggleButton = ({
    label,
    value,
    onClick,
  }: {
    label: string;
    value: boolean;
    onClick: () => void;
  }) => (
    <div className="mb-0">
      <button
        className={`btn ${
          value
            ? darkMode
              ? "btn-success"
              : "btn-success"
            : darkMode
            ? "btn-secondary text-light"
            : "btn-secondary"
        }`}
        onClick={onClick}
      >
        {label}: {value ? "On" : "Off"}
      </button>
    </div>
  );

  // Reusable number input for base, updated for dark mode styling
  const NumberInput = ({
    label,
    value,
    setValue,
    min,
    max,
  }: {
    label: string;
    value: number;
    setValue: (v: number) => void;
    min: number;
    max: number;
  }) => (
    <div className="mb-0">
      <label
        className={`form-label me-2 ${darkMode ? "text-light" : "text-dark"}`}
      >
        {label}:
      </label>
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => setValue(parseInt(e.target.value))}
        className={`form-control ${darkMode ? "bg-dark text-light" : ""}`}
        style={{ width: "70px" }}
      />
    </div>
  );
  
  const handleLeaveRoom = () => {
  if (socket) {
    try {
      // Optionally notify the server you're leaving
      socket.send(JSON.stringify({ type: "leave", room: "room1" }));

      // Close the WebSocket connection
      socket.close();
    } catch (err) {
      console.error("Error while leaving room:", err);
    }
  }

  // Reset client-side state
  resetGame();
  setIsMultiplayer(false);
  setSocket(null);
  setPlayerSymbol(null);
  setSelectedHand(null);
  setExchangeOccuring(null);
  setWinner(null);
  setGameOver(false);

  console.log("Left the room");
};


  const handleJoinServer = () => {
    resetGame();
    const ws = new WebSocket(`ws://${serverCode}`);

    ws.onopen = () => {
      console.log("Connected to server");
      const settings = { base, useBase, leftMult, rightMult };
      ws.send(
        JSON.stringify({ type: "join", room: "room1", gameType: "sticks", settings })
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
        setPlayerSymbol(message.player);
        const { gameState } = message;
        if (gameState) {
          setPlayers(gameState.hands);
          setCurrentPlayer(gameState.currentPlayer);
          setBase(gameState.base);
          setUseBase(gameState.useBase);
          setLeftMult(gameState.leftMult);
          setRightMult(gameState.rightMult);
        }
      }

      if (message.type === "select") {
        setSelectedHand(message.selectedHand);
        setOriginalState(message.originalState);
      }

      if (message.type === "attack") {
        setPlayers(message.hands);
        setCurrentPlayer(message.currentPlayer);
        setWinner(message.winner);
        setGameOver(message.gameOver);
        setSelectedHand(null);
        setExchangeOccuring(null);
      }

      if (message.type === "exchange") {
        setPlayers(message.hands);
        setExchangeOccuring(message.exchangeOccuring);
      }

      if (message.type === "cancelExchange") {
        setPlayers(message.hands);
        setExchangeOccuring(message.exchangeOccuring);
        setSelectedHand(message.selectedHand);
      }

      if (message.type === "reset") {
        setPlayers(message.hands);
        setCurrentPlayer(message.currentPlayer);
        setGameOver(false);
        setWinner(null);
        setSelectedHand(null);
        setExchangeOccuring(null);
      }
    };

    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
    };

    setSocket(ws);
  };

  const containerClass = darkMode ? "bg-dark text-light" : "bg-light text-dark";
  const defaultBtnClass = `btn ${
    darkMode ? "btn-outline-light" : "btn-outline-dark"
  } default-btn d-block ms-auto me-2`;

  return (
    <div
      className={`d-flex flex-column justify-content-between align-items-center ${containerClass}`}
      style={{ height: "100vh", position: "relative" }}
    >
      {/* Dark mode toggle and settings dropdown */}
      <div
        className="position-fixed"
        style={{ top: "1rem", right: "1rem", zIndex: 1000, width: "300px" }}
      >
        <div className="d-flex justify-content-end gap-2">
          {/* Dark Mode Toggle */}
          <DarkModeToggle darkMode={darkMode} toggleDarkMode={() => setDarkMode(!darkMode)} />
          {/* Settings Dropdown */}
          <div className="dropdown">
            <button
              className={defaultBtnClass}
              type="button"
              id="settingsDropdown"
              data-bs-toggle="dropdown"
              disabled={isMultiplayer}
              aria-expanded="false"
            >
              Settings
            </button>
            <ul
              className={`dropdown-menu dropdown-menu-end ${
                darkMode ? "bg-dark text-white" : ""
              }`}
              aria-labelledby="settingsDropdown"
              style={{ minWidth: "250px" }}
            >
              <li>
                <div
                  className="dropdown-item"
                  onClick={(e) => e.stopPropagation()}
                >
                  <NumberInput
                    label="Base"
                    value={base}
                    setValue={setBase}
                    min={2}
                    max={6}
                  />
                </div>
              </li>
              <li>
                <div
                  className="dropdown-item"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ToggleButton
                    label="Use Base"
                    value={useBase}
                    onClick={() => setUseBase(!useBase)}
                  />
                </div>
              </li>
              <li>
                <div
                  className="dropdown-item"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ToggleButton
                    label="Left Mult"
                    value={leftMult}
                    onClick={() => setLeftMult(!leftMult)}
                  />
                </div>
              </li>
              <li>
                <div
                  className="dropdown-item"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ToggleButton
                    label="Right Mult"
                    value={rightMult}
                    onClick={() => setRightMult(!rightMult)}
                  />
                </div>
              </li>
              <li>
                <div
                  className="dropdown-item"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className={`${defaultBtnClass} w-100`}
                    onClick={() => navigate("/home")}
                  >Go Home</button>
                </div>
              </li>
            </ul>
          </div>
        </div>

{/* Multiplayer Section */}
<div className="mt-2 pe-2">
  <div className="d-flex w-100">
    {isMultiplayer ? (
      // If already in multiplayer, show Leave Room
      <button
        className={`${defaultBtnClass} ms-auto`}
        style={{ width: 220 }}
        onClick={handleLeaveRoom}
      >
        Leave Room
      </button>
    ) : !showJoinField ? (
      // Default state (not in multiplayer, join button)
      <button
        className={`${defaultBtnClass} ms-auto`}
        style={{ width: 220 }}
        onClick={() => setShowJoinField(true)}
      >
        Join Multiplayer Server
      </button>
    ) : (
      // Input + Connect button
      <div className="d-flex ms-auto gap-2">
        <input
          type="text"
          value={serverCode}
          onChange={(e) => setServerCode(e.target.value)}
          placeholder="Enter server address"
          className="form-control"
          style={{ width: 220 }}
        />
        <button
          className={defaultBtnClass}
          onClick={handleJoinServer}
        >
          Connect
        </button>
      </div>
    )}
  </div>
</div>
      </div>

      {/* Top player's hands (upside down) */}
      <div
        style={{
          transform: "rotate(180deg)",
          marginTop: "-2%",
          position: "relative",
        }}
      >
        <Hands
          left={players.top.left}
          right={players.top.right}
          leftActive={
            (currentPlayer === "top" && selectedHand === "left") ||
            exchangeOccuring === "top"
          }
          rightActive={
            (currentPlayer === "top" && selectedHand === "right") ||
            exchangeOccuring === "top"
          }
          onLeftClick={() => handleHandClick("top", "left")}
          onRightClick={() => handleHandClick("top", "right")}
          multiplication={[leftMult, rightMult]}
        />
        {exchangeOccuring === "top" && (
          <button onClick={handleConfirmSwitch} className="confirm-button top">
            Done
          </button>
        )}
      </div>

      {/* Game Over Message & Play Again Button */}
      {gameOver && (
        <div
          className="position-absolute text-center"
          style={{
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 500,
          }}
        >
          <h2 className="mb-3">
            {winner === "top" ? "P2" : winner === "bottom" ? "P1" : ""} wins!
          </h2>
          <button className={defaultBtnClass} onClick={resetGame}>
            Play Again
          </button>
        </div>
      )}

      {/* Bottom player's hands */}
      <div style={{ position: "relative", marginBottom: "-2%" }}>
        <Hands
          left={players.bottom.left}
          right={players.bottom.right}
          leftActive={
            (currentPlayer === "bottom" && selectedHand === "left") ||
            exchangeOccuring === "bottom"
          }
          rightActive={
            (currentPlayer === "bottom" && selectedHand === "right") ||
            exchangeOccuring === "bottom"
          }
          onLeftClick={() => handleHandClick("bottom", "left")}
          onRightClick={() => handleHandClick("bottom", "right")}
          multiplication={[leftMult, rightMult]}
        />
        {exchangeOccuring === "bottom" && (
          <button
            onClick={handleConfirmSwitch}
            className="confirm-button bottom"
          >
            Done
          </button>
        )}
      </div>
    </div>
  );
};

export default Sticks;
