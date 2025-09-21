import { useState, useEffect, useRef } from "react";
import "../styles/App.css";
import { useNavigate } from "react-router-dom";

interface gridTile {
    revealed: boolean;
    flagged: boolean;
    value: number; // -1 is mine, 0-8 is number of adjacent mines
    x: number; // column index [0, horizontalTiles - 1]
    y: number; // row index [0, verticalTiles - 1]
}

function App() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const screenHeight = document.documentElement.clientHeight;
    const screenWidth = document.documentElement.clientWidth;

    const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("easy");

    const [gameOver, setGameOver] = useState(false);
    const [win, setWin] = useState(false);

    const navigate = useNavigate();

    const boardSizes = {
        easy: 8,
        medium: 16,
        hard: 32,
    }; // yields vertical tiles, horizontal tiles is double

    const verticalTiles = boardSizes[difficulty];
    const horizontalTiles = boardSizes[difficulty] * 2;

    const tileHeight = screenHeight / boardSizes[difficulty];
    const tileWidth = screenWidth / (boardSizes[difficulty] * 2);

    const mineCounts = {
        easy: 12,
        medium: 48,
        hard: 200,
    };

    let mineField : gridTile[][] = []; // -1 is mine, 0-8 is number of adjacent mines

    for (let row = 0; row < verticalTiles; row++) {
        mineField[row] = [];
        for (let col = 0; col < horizontalTiles; col++) {
            mineField[row][col] = {
                revealed: false,
                flagged: false,
                value: 0,
                x: col,
                y: row
            };
        }
    }

    let minesPlaced = 0;
    while (minesPlaced < mineCounts[difficulty]) {
        const row = Math.floor(Math.random() * verticalTiles);
        const col = Math.floor(Math.random() * horizontalTiles);

        if (mineField[row][col].value === 0) {
            mineField[row][col].value = -1;
            minesPlaced++;
        }
    }

    for (let row = 0; row < verticalTiles; row++) {
        for (let col = 0; col < horizontalTiles; col++) {
            if (mineField[row][col].value === -1) continue;
            let count = 0;
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    if (dr === 0 && dc === 0) continue; // skip self
                    const r = row + dr;
                    const c = col + dc;
                    if (r < 0 || r >= verticalTiles || c < 0 || c >= horizontalTiles) continue;

                    if (mineField[r][c].value === -1) count++;
                }
            }
            mineField[row][col].value = count;
        }
    }

    function squarePos(tile: gridTile) : [number, number] {
        return [
            tile.x * (screenWidth / horizontalTiles),
            tile.y * (screenHeight / verticalTiles),
        ];
    }

    const drawTile = (tile: gridTile, ctx : CanvasRenderingContext2D) => {
        const [x, y] = squarePos(tile);

        ctx.fillStyle = tile.revealed ? "white" : "lightgray";
        ctx.fillRect(x, y, tileWidth, tileHeight);

        ctx.strokeStyle = "black";
        ctx.strokeRect(x, y, tileWidth, tileHeight);

        if (tile.flagged && !tile.revealed) {
            ctx.fillStyle = "orange";
            ctx.beginPath();
            ctx.arc(x + tileWidth / 2, y + tileHeight / 2, Math.min(tileWidth, tileHeight) / 4, 0, 2 * Math.PI);
            ctx.fill();
        }

        if (tile.value > 0 && tile.revealed) {
            ctx.fillStyle = "black";
            ctx.font = "20px Arial";
            ctx.fillText(tile.value.toString(), x + tileWidth / 2, y + tileHeight / 2);
        }

        if (tile.value === -1 && tile.revealed) {
            ctx.fillStyle = "red";
            ctx.beginPath();
            ctx.arc(x + tileWidth / 2, y + tileHeight / 2, Math.min(tileWidth, tileHeight) / 4, 0, 2 * Math.PI);
            ctx.fill();

            setGameOver(true);
            console.log("Game Over!");
        }

    };

    function tileAt(x: number, y: number) : gridTile | null {
        const col = Math.floor(x / tileWidth);
        const row = Math.floor(y / tileHeight); 

        if (col < 0 || col >= horizontalTiles || row < 0 || row >= verticalTiles) {
            return null;
        }

        return mineField[row][col];
    }

    function revealTile(tile: gridTile) {
        if (tile.revealed || tile.flagged) return;

        tile.revealed = true;

        if (tile.value > 0) return;

        if (tile.value === -1) {
            for (let row = 0; row < verticalTiles; row++) {
                for (let col = 0; col < horizontalTiles; col++) {
                    mineField[row][col].revealed = true;
                }
            }

            return;
        }

        floodFill(tile);
    }

    function floodFill(startTile: gridTile) {
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue; // skip self
                const r = startTile.y + dr;
                const c = startTile.x + dc;
                if (r < 0 || r >= verticalTiles || c < 0 || c >= horizontalTiles) continue;

                const tile = mineField[r][c];
                if (tile.revealed || tile.flagged) continue;

                tile.revealed = true;

                if (tile.value === 0) {
                    floodFill(tile);
                }
            }
        }
    }


    useEffect(() => {
        if (gameOver) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.width = screenWidth;
        canvas.height = screenHeight;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const handleMouseDown = (event: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            const tile = tileAt(x, y);
            console.log(tile);
            if (!tile) return;

            if (event.button === 0) {
                console.log("Revealing tile", tile);
                revealTile(tile);
            } else if (event.button === 1 || event.button === 2) {
                console.log("Flagging tile", tile);
                tile.flagged = !tile.flagged;
            }

        };

        const disableContextMenu = (e: MouseEvent) => e.preventDefault();


        canvas.addEventListener("mousedown", handleMouseDown);
        canvas.addEventListener("contextmenu", disableContextMenu);


        for (let row = 0; row < verticalTiles; row++) {
            for (let col = 0; col < horizontalTiles; col++) {
                drawTile(mineField[row][col], ctx);
            }
        }

        let animationFrameId: number;
        
        function gameLoop() {
            if (!ctx) return;

            for (let row = 0; row < verticalTiles; row++) {
                for (let col = 0; col < horizontalTiles; col++) {
                    drawTile(mineField[row][col], ctx);
                }
            }

            let allNonMinesRevealed = true;
            let lost = false;
            for (let row = 0; row < verticalTiles; row++) {
                for (let col = 0; col < horizontalTiles; col++) {
                    const tile = mineField[row][col];
                    if (!tile.revealed && tile.value !== -1) {
                        allNonMinesRevealed = false;
                    }

                    if (tile.value === -1 && tile.revealed) {
                        lost = true;
                    }
                }
            }

            if (allNonMinesRevealed) {
                setWin(true);
                setGameOver(true);
            }

            if (lost) {
                setWin(false);
                setGameOver(true);
            }

            animationFrameId = requestAnimationFrame(gameLoop);
        }

        gameLoop();

        return () => {
            canvas.removeEventListener("mousedown", handleMouseDown);
            canvas.removeEventListener("contextmenu", disableContextMenu);
            cancelAnimationFrame(animationFrameId);
        };
    }, [gameOver]);

    const winLoss = win ? "You Win!" : "You Lose!";

    const gameOverOverlayStyle: React.CSSProperties = {
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      textAlign: "center",
    };

    const gameOverBoxStyle: React.CSSProperties = {
      backgroundColor: "white",
      padding: "2rem",
      borderRadius: "8px",
      border: "2px solid black",
    };

    const buttonStyle: React.CSSProperties = {
      width: "150px",
      padding: "10px 20px",
      fontSize: "18px",
    };

  return (
    <div style={{ position: "relative" }}>
      <canvas ref={canvasRef} style={{ display: "block" }} />
      {gameOver && (
        <div style={gameOverOverlayStyle}>
          <div style={gameOverBoxStyle}>
            <h1>Game Over: {winLoss}</h1>

            <div className="btn-group mt-3" role="group" aria-label="Difficulty settings" style={{ marginBottom: "1rem" }}>
              <input type="radio" className="btn-check" name="difficulty" id="easy" autoComplete="off" checked={difficulty === 'easy'} onChange={() => setDifficulty('easy')} />
              <label className="btn btn-outline-success" htmlFor="easy">Easy</label>

              <input type="radio" className="btn-check" name="difficulty" id="medium" autoComplete="off" checked={difficulty === 'medium'} onChange={() => setDifficulty('medium')} />
              <label className="btn btn-outline-warning" htmlFor="medium">Medium</label>

              <input type="radio" className="btn-check" name="difficulty" id="hard" autoComplete="off" checked={difficulty === 'hard'} onChange={() => setDifficulty('hard')} />
              <label className="btn btn-outline-danger" htmlFor="hard">Hard</label>
            </div>

            <button className="default-btn d-block mx-auto" onClick={() => setGameOver(false)} style={buttonStyle}>
              Restart
            </button>

            <button className="default-btn d-block mx-auto mt-2" onClick={() => navigate("/home")} style={buttonStyle}>
              Go Home
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;