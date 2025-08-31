const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 3001 });
const rooms = {}; // { roomId: { gameType, players: [ws1, ws2], gameState: {...} } }

// Tic-Tac-Toe helper
function detectWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (const [a, b, c] of lines) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

// Game logic handlers by type
const gameHandlers = {
  tictactoe: {
    initState: () => ({
      board: Array(9).fill(null),
      xIsNext: false,
      winner: null,
    }),

    generatePlayer: (i) => {
      return i === 0 ? "O" : "X";
    },

    handleMove: (gameState, data) => {
      const { index } = data;
      if (gameState.board[index] || gameState.winner) return null;

      const symbol = gameState.xIsNext ? "X" : "O";
      gameState.board[index] = symbol;
      gameState.xIsNext = !gameState.xIsNext;
      gameState.winner = detectWinner(gameState.board);

      return {
        type: "updateBoard",
        squares: gameState.board,
        xIsNext: gameState.xIsNext,
        winner: gameState.winner,
      };
    },

    handleReset: (gameState) => {
      gameState.board = Array(9).fill(null);
      gameState.xIsNext = false;
      gameState.winner = null;

      return {
        type: "boardClear",
      };
    },
  },

  sticks: {
    initState: (settings = {}) => ({
      hands: {
        top: { left: 1, right: 1 },
        bottom: { left: 1, right: 1 },
      },
      currentPlayer: "bottom",
      // Default game settings
      base: 5,
      useBase: false,
      leftMult: false,
      rightMult: false,
      // Override with host's settings
      ...settings,
    }),

    generatePlayer: (i) => {
      return i === 0 ? "bottom" : "top";
    },

    handleMove: (gameState, data) => {
      const {
        player,
        hand,
        selectedHand,
        exchangeOccuring,
        originalState,
      } = data.move;

      // Game rules are now authoritative from the server's game state
      const { base, leftMult, rightMult, useBase } = gameState;

      const currentPlayer = gameState.currentPlayer;
      const players = gameState.hands;

      const newHands = JSON.parse(JSON.stringify(players)); // deep clone hands

      if (player === currentPlayer && selectedHand === null) {
        // select hand
        const isLeft = hand === "left";
        const shouldMultiply = (isLeft && leftMult) || (!isLeft && rightMult);

        if (players[currentPlayer][hand] === 0) return { type: "invalid" };
        if (players[currentPlayer][hand] === 1 && shouldMultiply) return { type: "invalid" };

        return {
          type: "select",
          selectedHand: hand,
          originalState: [
            players[currentPlayer]["left"],
            players[currentPlayer]["right"],
          ],
        };
      }

      if (player !== currentPlayer && selectedHand !== null) {
        // attack
        if (exchangeOccuring) return { type: "invalid" };

        const sourceValue = players[currentPlayer][selectedHand];
        const targetValue = players[player][hand];

        const isLeft = selectedHand === "left";
        const shouldMultiply = (isLeft && leftMult) || (!isLeft && rightMult);

        let newValue = shouldMultiply
          ? sourceValue * targetValue
          : sourceValue + targetValue;


        if (newValue >= base) {
          newValue = useBase ? newValue % base : 0;
        }

        newHands[player][hand] = newValue;

        // check if opponent has lost
        const hasLost = Object.values(newHands[player]).every(
          (val) => val === 0
        );
        gameState.currentPlayer = hasLost ? currentPlayer : player;
        gameState.hands = newHands;

        return {
          type: "attack",
          hands: newHands,
          currentPlayer: hasLost ? currentPlayer : player,
          winner: hasLost ? currentPlayer : null,
          gameOver: hasLost,
        };
      }

      if (player === currentPlayer && selectedHand !== null) {
        // exchange
        if (hand === selectedHand) {
          const otherHand = hand === "left" ? "right" : "left";

          if (players[currentPlayer][otherHand] === 0)
            return { type: "invalid" };

          newHands[currentPlayer][selectedHand] += 1;
          newHands[currentPlayer][otherHand] -= 1;

          return {
            type: "exchange",
            hands: newHands,
            exchangeOccuring: currentPlayer,
          };
        }

        // exchange step
        const selectedValue = players[currentPlayer][selectedHand];
        const targetValue = players[currentPlayer][hand];

        const newSelectedValue =
          hand === selectedHand ? selectedValue + 1 : selectedValue - 1;
        const newTargetValue =
          hand === selectedHand ? targetValue - 1 : targetValue + 1;

        // cancel if invalid
        if (
          newSelectedValue < 0 ||
          newTargetValue < 0 ||
          newSelectedValue > base - 1 ||
          newTargetValue > base - 1
        ) {
          gameState.hands = {
              ...players,
              [currentPlayer]: {
                left: originalState?.[0] ?? players[currentPlayer].left,
                right: originalState?.[1] ?? players[currentPlayer].right,
              },
            };
            gameState.exchangeOccuring = null;
            gameState.selectedHand = null;

          return {
            type: "cancelExchange",
            hands: gameState.hands,
            exchangeOccuring: null,
            selectedHand: null,
          };
        }

        newHands[currentPlayer][selectedHand] -= 1;
        newHands[currentPlayer][hand] += 1;

        gameState.hands = newHands;
        gameState.exchangeOccuring = currentPlayer;

        return {
          type: "exchange",
          hands: newHands,
          exchangeOccuring: currentPlayer,
        };
      }

      return { type: "invalid" };
    },

    handleReset: (gameState) => {
      gameState.hands = {
        top: { left: 1, right: 1 },
        bottom: { left: 1, right: 1 },
      };
      gameState.currentPlayer = "bottom";
      gameState.gameOver = false;
      gameState.winner = null;
      gameState.selectedHand = null;
      gameState.exchangeOccuring = null;

      return {
        type: "reset",
        hands: {
        top: { left: 1, right: 1 },
        bottom: { left: 1, right: 1 },
      },
        currentPlayer: "bottom"
      };
    },
  },
};

wss.on("connection", (ws) => {
  ws.on("message", (msg) => {
    const data = JSON.parse(msg);
    const { type, room, gameType, settings } = data;

    if (type === "join") {
      if (!rooms[room]) {
        if (!gameHandlers[gameType]) {
          ws.send(
            JSON.stringify({ type: "error", message: "Invalid game type" })
          );
          return;
        }

        rooms[room] = {
          gameType,
          players: [],
          gameState: gameHandlers[gameType].initState(settings),
        };
      }

      rooms[room].players.push(ws);
      ws.room = room;
      ws.send(JSON.stringify({ type: "joined", room, gameType }));

      if (rooms[room].players.length === 2) {
        console.log(
          `Game starting in room "${room}" (${rooms[room].gameType})`
        );
        rooms[room].players.forEach((client, i) =>
          client.send(
            JSON.stringify({
              type: "startGame",
              player: gameHandlers[gameType].generatePlayer(i),
              gameState: rooms[room].gameState,
            })
          )
        );
      }
      return;
    }

    if (type === "move") {
      console.log(data)
      const currentRoom = rooms[ws.room];
      if (!currentRoom) return;

      const response = gameHandlers[currentRoom.gameType].handleMove(
        currentRoom.gameState,
        data
      );
      if (!response) return;

      console.log("RESPONSE: \n ________________________");
      console.log(response);

      currentRoom.players.forEach((client) =>
        client.send(JSON.stringify(response))
      );
    }

    if (type === "reset") {
      const currentRoom = rooms[ws.room];
      if (!currentRoom) return;

      const response = gameHandlers[currentRoom.gameType].handleReset(
        currentRoom.gameState
      );
      currentRoom.players.forEach((client) =>
        client.send(JSON.stringify(response))
      );
      return;
    }

    // NEW: handle leave
    if (type === "leave") {
      const currentRoom = rooms[ws.room];
      if (!currentRoom) return;

      // remove this client from the room
      currentRoom.players = currentRoom.players.filter((client) => client !== ws);

      // notify the others
      currentRoom.players.forEach((client) =>
        client.send(JSON.stringify({ type: "playerLeft", room: ws.room }))
      );

      console.log(`Player left room "${ws.room}"`);

      // if no one left in the room, clean it up
      if (currentRoom.players.length === 0) {
        delete rooms[ws.room];
        console.log(`Room "${ws.room}" deleted (empty)`);
      }

      ws.room = null;
      return;
    }

    // fallback for unknown types
    console.log("ERROR, UNRECOGNIZED TYPE");
    console.log(data);
    console.log("ERROR, UNRECOGNIZED TYPE");
  });

  ws.on("close", () => {
    if (ws.room && rooms[ws.room]) {
      rooms[ws.room].players = rooms[ws.room].players.filter((client) => client !== ws);

      rooms[ws.room].players.forEach((client) =>
        client.send(JSON.stringify({ type: "playerLeft", room: ws.room }))
      );

      if (rooms[ws.room].players.length === 0) {
        delete rooms[ws.room];
        console.log(`Room "${ws.room}" deleted (empty after disconnect)`);
      }
    }
  });

});