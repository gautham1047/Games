import { useState, useEffect, useRef } from "react";
import "../styles/App.css";
import "../styles/MineSweeper.css";
import { useNavigate } from "react-router-dom";

interface gridTile {
    revealed: boolean;
    flagged: boolean;
    value: number; // -1 is mine, 0-8 is number of adjacent mines
    x: number; // column index [0, horizontalTiles - 1]
    y: number; // row index [0, verticalTiles - 1]
}

function MineSweeper() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("easy");

    const [gameOver, setGameOver] = useState(false);
    const [win, setWin] = useState(false);
    const [mineField, setMineField] = useState<gridTile[][]>([]);

    const navigate = useNavigate();

    const boardSizes = {
        easy: 8,
        medium: 16,
        hard: 24,
    }; // yields vertical tiles, horizontal tiles is double

    const verticalTiles = boardSizes[difficulty];
    const horizontalTiles = boardSizes[difficulty] * 2;

    // Calculate the best canvas size to fit the screen while maintaining a 2:1 aspect ratio
    const availableWidth = document.documentElement.clientWidth * 0.95;
    const availableHeight = document.documentElement.clientHeight * 0.95;

    // Determine canvas size based on the limiting dimension
    let canvasWidth = availableWidth;
    let canvasHeight = availableWidth / 2;

    if (canvasHeight > availableHeight) {
        canvasHeight = availableHeight;
        canvasWidth = availableHeight * 2;
    }

    const tileHeight = canvasHeight / verticalTiles;
    const tileWidth = canvasWidth / horizontalTiles;

    const mineCounts = {
        easy: 12,
        medium: 48,
        hard: 99,
    };

    const createBoard = () => {
        let newMineField: gridTile[][] = [];
        for (let row = 0; row < verticalTiles; row++) {
            newMineField[row] = [];
            for (let col = 0; col < horizontalTiles; col++) {
                newMineField[row][col] = { revealed: false, flagged: false, value: 0, x: col, y: row };
            }
        }

        let minesPlaced = 0;
        while (minesPlaced < mineCounts[difficulty]) {
            const row = Math.floor(Math.random() * verticalTiles);
            const col = Math.floor(Math.random() * horizontalTiles);
            if (newMineField[row][col].value === 0) {
                newMineField[row][col].value = -1;
                minesPlaced++;
            }
        }

        for (let row = 0; row < verticalTiles; row++) {
            for (let col = 0; col < horizontalTiles; col++) {
                if (newMineField[row][col].value === -1) continue;
                let count = 0;
                for (let dr = -1; dr <= 1; dr++) {
                    for (let dc = -1; dc <= 1; dc++) {
                        if (dr === 0 && dc === 0) continue;
                        const r = row + dr;
                        const c = col + dc;
                        if (r < 0 || r >= verticalTiles || c < 0 || c >= horizontalTiles) continue;
                        if (newMineField[r][c].value === -1) count++;
                    }
                }
                newMineField[row][col].value = count;
            }
        }
        setMineField(newMineField);
        setGameOver(false);
        setWin(false);
    };

    function squarePos(tile: gridTile) : [number, number] {
        return [tile.x * tileWidth, tile.y * tileHeight];
    }

    const drawTile = (tile: gridTile, ctx : CanvasRenderingContext2D) => {
        const [x, y] = squarePos(tile);

        ctx.fillStyle = tile.revealed ? "#e3d9cf" : "#bfb3a7";
        ctx.fillRect(x, y, tileWidth, tileHeight);

        ctx.strokeStyle = "#9e9186";
        ctx.strokeRect(x, y, tileWidth, tileHeight);

        if (tile.flagged && !tile.revealed) {
            ctx.fillStyle = "#f2b179";
            ctx.beginPath();
            ctx.arc(x + tileWidth / 2, y + tileHeight / 2, Math.min(tileWidth, tileHeight) / 4, 0, 2 * Math.PI);
            ctx.fill();
        }

        if (tile.value > 0 && tile.revealed) {
            ctx.fillStyle = "#776e65";
            ctx.font = `bold ${Math.min(tileWidth, tileHeight) * 0.6}px Arial`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(tile.value.toString(), x + tileWidth / 2, y + tileHeight / 2);
        }

        if (tile.value === -1 && tile.revealed) {
            ctx.fillStyle = "#f65e3b";
            ctx.beginPath();
            ctx.arc(x + tileWidth / 2, y + tileHeight / 2, Math.min(tileWidth, tileHeight) / 4, 0, 2 * Math.PI);
            ctx.fill();
        }

    };

    function tileAt(x: number, y: number) : gridTile | null {
        const col = Math.floor(x / tileWidth);
        const row = Math.floor(y / tileHeight); 

        if (col < 0 || col >= horizontalTiles || row < 0 || row >= verticalTiles) {
            return null;
        }

        return mineField[row]?.[col];
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
        createBoard();
    }, [difficulty]);

    useEffect(() => {
        if (gameOver || !mineField.length) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const handleMouseDown = (event: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            const tile = tileAt(x, y);
            if (!tile) return;

            if (event.button === 0) {
                revealTile(tile);
            } else if (event.button === 1 || event.button === 2) {
                tile.flagged = !tile.flagged;
            }

        };

        const disableContextMenu = (e: MouseEvent) => e.preventDefault();


        canvas.addEventListener("mousedown", handleMouseDown);
        canvas.addEventListener("contextmenu", disableContextMenu);

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
    }, [gameOver, mineField]);

    const winLoss = win ? "You Win!" : "You Lose!";

  return (
    <div className="minesweeper-page-container">
      <div className="game-container">
        <canvas 
            ref={canvasRef} 
            width={canvasWidth}
            height={canvasHeight}
            className="game-canvas"
        />
        {gameOver && (
          <div className="game-over-overlay">
            <div className="game-over-box">
              <h2>{winLoss}</h2>

              <div className="difficulty-controls mt-3 mb-3">
                <div className="btn-group" role="group" aria-label="Difficulty settings">
                  <input type="radio" className="btn-check" name="difficulty" id="easy" autoComplete="off" checked={difficulty === 'easy'} onChange={() => setDifficulty('easy')} />
                  <label className="btn btn-outline-success" htmlFor="easy">Easy</label>

                  <input type="radio" className="btn-check" name="difficulty" id="medium" autoComplete="off" checked={difficulty === 'medium'} onChange={() => setDifficulty('medium')} />
                  <label className="btn btn-outline-warning" htmlFor="medium">Medium</label>

                  <input type="radio" className="btn-check" name="difficulty" id="hard" autoComplete="off" checked={difficulty === 'hard'} onChange={() => setDifficulty('hard')} />
                  <label className="btn btn-outline-danger" htmlFor="hard">Hard</label>
                </div>
              </div>

              <button className="btn btn-primary w-100" onClick={createBoard}>
                Restart
              </button>

              <button className="btn btn-secondary w-100 mt-2" onClick={() => navigate("/home")}>
                Go Home
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MineSweeper;