import { useState, useEffect, useRef } from "react";
import "../styles/App.css";
import "../styles/TwentyFortyEight.css";
import { useNavigate } from "react-router-dom";

interface Tile {
  value: number;
  x : number; 
  y : number;
}

function TwentyFourtyEight() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [gameOver, setGameOver] = useState(false);

  const navigate = useNavigate();

  const gridSize = Math.min(document.documentElement.clientHeight, document.documentElement.clientWidth) * 0.8;

  const [numTiles, setNumTiles] = useState(4);

  function createInitialTiles(numTiles: number): Tile[][] {
  const arr: Tile[][] = [];
  for (let i = 0; i < numTiles; i++) {
    arr[i] = [];
    for (let j = 0; j < numTiles; j++) {
      arr[i][j] = { value: 0, x: j, y: i };
    }
  }

  spawnRandomTileOnBoard(arr, numTiles);
  spawnRandomTileOnBoard(arr, numTiles);

  return arr;
}

  const [tiles, setTiles] = useState<Tile[][]>(createInitialTiles(numTiles));
  const [score, setScore] = useState(0);

  const tileSize = gridSize / numTiles;

  const colors: { [key: number]: string } = {
    0: "#cdc1b4",
    2: "#eee4da",
    4: "#ede0c8",
    8: "#f2b170",
    16: "#f59563",
    32: "#f67c5f",
    64: "#f65e3b",
    128: "#edcf72",
    256: "#edcc61",
    512: "#edc850",
    1024: "#edc53f",
    2048: "#edc22e",
  };

  const squarePos = (x: number, y: number) => {
    return [(x + 0.5) * tileSize, (y + 0.5) * tileSize];
  };

  const drawTile = (tile: Tile, ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = (tile.value > 2048) ? "#6b5405" : colors[tile.value] || "#3c3a32";
    const [x, y] = squarePos(tile.x, tile.y);
    ctx.fillRect(x, y, tileSize, tileSize);

    ctx.strokeStyle = "#bbada0";
    ctx.strokeRect(x, y, tileSize, tileSize);

    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `${tileSize / 3}px Arial`;
    if (tile.value !== 0) {
      ctx.fillText(tile.value.toString(), x + 0.5 * tileSize, y + 0.5 * tileSize);
    } else {
      ctx.fillText("", x + 0.5 * tileSize, y + 0.5 * tileSize);
    }
  };

  const drawAllTiles = (ctx: CanvasRenderingContext2D) => {
    for (let i = 0; i < numTiles; i++) {
      for (let j = 0; j < numTiles; j++) {
        drawTile(tiles[i][j], ctx);
      }
    }
  };

function spawnRandomTileOnBoard(board: Tile[][], numTiles: number) {
  const emptyTiles: Tile[] = [];
  for (let i = 0; i < numTiles; i++) {
    for (let j = 0; j < numTiles; j++) {
      if (board[i][j].value === 0) {
        emptyTiles.push(board[i][j]);
      }
    }
  }

  if (emptyTiles.length > 0) {
    const randomTile = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
    randomTile.value = Math.random() < 0.75 ? 2 : 4;
  }
}


const directionVectors = {
  ArrowUp:    { dx: 0, dy: -1, startX: 0, startY: 0, loopX: 1, loopY: 1 },
  ArrowDown:  { dx: 0, dy: 1,  startX: 0, startY: numTiles - 1, loopX: 1, loopY: -1 },
  ArrowLeft:  { dx: -1, dy: 0, startX: 0, startY: 0, loopX: 1, loopY: 1 },
  ArrowRight: { dx: 1, dy: 0,  startX: numTiles - 1, startY: 0, loopX: -1, loopY: 1 },
};

const moveTiles = (direction: string) => {
  const vector = directionVectors[direction as keyof typeof directionVectors];
  if (!vector) return;

  // Deep copy tiles to avoid mutating state directly
  const newTiles = tiles.map(row => row.map(tile => ({ ...tile })));

  for (let y = vector.startY; y >= 0 && y < numTiles; y += vector.loopY) {
    for (let x = vector.startX; x >= 0 && x < numTiles; x += vector.loopX) {
      let tile = newTiles[y][x];
      if (tile.value === 0) continue;

      let nx = x, ny = y;
      while (true) {
        const nextX = nx + vector.dx;
        const nextY = ny + vector.dy;
        if (
          nextX < 0 || nextX >= numTiles ||
          nextY < 0 || nextY >= numTiles ||
          (newTiles[nextY][nextX].value !== 0 && newTiles[nextY][nextX].value !== tile.value)
        ) break;

        // Merge or move
        if (newTiles[nextY][nextX].value === tile.value) {
          newTiles[nextY][nextX].value *= 2;
          tile.value = 0;
          setScore(prevScore => prevScore + newTiles[nextY][nextX].value);
          break;
        } else if (newTiles[nextY][nextX].value === 0) {
          newTiles[nextY][nextX].value = tile.value;
          tile.value = 0;
          nx = nextX;
          ny = nextY;
          tile = newTiles[ny][nx];
        }
      }
    }
  }

  spawnRandomTileOnBoard(newTiles, numTiles);
  setTiles(newTiles);
};

const resetGame = (size: number) => {
    setNumTiles(size);
    setTiles(createInitialTiles(size));
    setScore(0);
    setGameOver(false);
  };

const hasMoves = (board : Tile[][]) => {
  for (let i = 0; i < numTiles; i++) {
    for (let j = 0; j < numTiles; j++) {
      if (board[i][j].value === 0) return true;
      if (j < numTiles - 1 && board[i][j].value === board[i][j + 1].value) return true;
      if (i < numTiles - 1 && board[i][j].value === board[i + 1][j].value) return true;
    }
  }
  return false;

}

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const onKeyDown = (e: KeyboardEvent) => {
      moveTiles(e.key);

      if (!hasMoves(tiles)) {
        setGameOver(true);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    drawAllTiles(ctx);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
    
    }, [tiles, numTiles]);


  const isLandscape = document.documentElement.clientWidth >= document.documentElement.clientHeight;

  return (
    <div className={`twenty-forty-eight-container ${isLandscape ? "landscape" : "portrait"}`}>
      <canvas
        ref={canvasRef}
        width={gridSize + tileSize}
        height={gridSize + tileSize}
        className="game-canvas"
      />
      <div className="game-ui">
        <div className="game-ui-main">
          <h2 className="game-title">2048</h2>
        </div>
        <div className="score-container">
          {gameOver ? <div className="game-over-message">Game Over!</div> : <strong>Score: {score}</strong>}
        </div>
        <div className="game-ui-footer">
          <div className="tile-size-control">
            <button className="restart-button" onClick={() => resetGame(numTiles)}>Restart</button>
            <button className="home-button" onClick={() => navigate("/home")}>Go Home</button>
            <label htmlFor="num-tiles">Grid Size:</label>
            <input
              id="num-tiles"
              type="range"
              value={numTiles}
              onChange={(e) => resetGame(parseInt(e.target.value, 10))}
              min="2"
              max="10"
            />
            <span>{numTiles}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TwentyFourtyEight;