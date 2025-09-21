import { useEffect, useState, useRef } from "react";
import "../styles/App.css";
import { useNavigate } from "react-router-dom";

interface SnakeSegment {
  x: number;
  y: number;
}

interface Snake {
  segments: SnakeSegment[];
  direction: number; // 0 left, 1 up, 2 right, 3 down
}

interface Apple {
  x: number;
  y: number;
}

function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const screenHeight = document.documentElement.clientHeight;
  const screenWidth = document.documentElement.clientWidth;

  const horizontalSquares = 32; // all x coordinate between [0, horizontalSquares - 1]
  const verticalSquares = 16; // all y coordinates between [0, verticalSquares - 1]

  const squareHeight = screenHeight / verticalSquares;
  const squareWidth = screenWidth / horizontalSquares;

  const frameGap = 10; // Snake moves every 10 frames. Adjust for speed.

  const [gameOver, setGameOver] = useState(false);

  const navigate = useNavigate();

  function squarePos(x: number, y: number) {
    return [
      x * (screenWidth / horizontalSquares),
      y * (screenHeight / verticalSquares),
    ];
  }

  function drawSnake(snake: Snake, ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "green";
    let segments = snake.segments;
    segments.forEach((segment) => {
      const [x, y] = squarePos(segment.x, segment.y);
      ctx.fillRect(x, y, squareWidth, squareHeight);
    });
  }

  function drawApple(apple: Apple, ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "red";
    const [x, y] = squarePos(apple.x, apple.y);
    ctx.fillRect(x, y, squareWidth, squareHeight);
  }

  function hitApple(snake : Snake, apple: Apple): boolean {
    const head = snake.segments[0];
    return head.x === apple.x && head.y === apple.y;
  }

  function hitWall(snake: Snake): boolean {
    const head = snake.segments[0];
    return head.x < 0 || head.x >= horizontalSquares || head.y < 0 || head.y >= verticalSquares;
  }

  function hitSelf(snake: Snake): boolean {
    const head = snake.segments[0];
    return snake.segments.slice(1).some(segment => segment.x === head.x && segment.y === head.y);
  }

  function moveSnake(snake: Snake): Snake {
    const head = snake.segments[0];
    let newHead: SnakeSegment;

    switch (snake.direction) {
      case 0: // left
        newHead = { x: head.x - 1, y: head.y };
        break;
      case 1: // up
        newHead = { x: head.x, y: head.y - 1 };
        break;
      case 2: // right
        newHead = { x: head.x + 1, y: head.y };
        break;
      case 3: // down
        newHead = { x: head.x, y: head.y + 1 };
        break;
      default:
        newHead = { ...head };
    }

    // add new head to front, remove last segment
    const newSegments = [newHead, ...snake.segments.slice(0, -1)];

    return {
      ...snake,
      segments: newSegments,
    };
  }

  function updateGameState(
    snake: Snake,
    apple: Apple,
    frameCount: React.MutableRefObject<number>,
    ctx: CanvasRenderingContext2D
  ): {snake : Snake, apple: Apple, stillRunning : boolean} {
    if (frameCount.current % frameGap !== 0) {
      drawSnake(snake, ctx);
      drawApple(apple, ctx);
      return { snake: snake, apple: apple, stillRunning: true };
    }

    const newSnake = moveSnake(snake);

    if (hitWall(newSnake) || hitSelf(newSnake)) {
      return { snake: newSnake, apple: apple, stillRunning: false };
    }

    let newApple = apple;


    if (hitApple(newSnake, apple)) {
      // Grow snake by adding a new segment at the tail
      const tail = newSnake.segments[newSnake.segments.length - 1];
      newSnake.segments.push({ ...tail });

      // Move apple to a new random position not occupied by the snake
      do {
        newApple = {
          x: Math.floor(Math.random() * horizontalSquares),
          y: Math.floor(Math.random() * verticalSquares),
        };
      } while (snake.segments.some((segment) => segment.x === newApple.x && segment.y === newApple.y));
    }

    drawSnake(newSnake, ctx);
    drawApple(newApple, ctx);

    return { snake: newSnake, apple: newApple, stillRunning: true };
  }

  useEffect(() => {
    if (gameOver) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = screenWidth;
    canvas.height = screenHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let snake: Snake = {
      segments: [{ x: 12, y: 8 }],
      direction: 2, // 2 = right
    };
    let apple: Apple = { x: 20, y: 8 };
    let stillRunning = true;

    function handleKeyDown(event: KeyboardEvent) {
      switch (event.key) {
        case "a":
        case "ArrowLeft":
          if (snake.direction !== 2) snake.direction = 0;
          break;
        case "w":
        case "ArrowUp":
          if (snake.direction !== 3) snake.direction = 1;
          break;
        case "d":
        case "ArrowRight":
          if (snake.direction !== 0) snake.direction = 2;
          break;
        case "s":
        case "ArrowDown":
          if (snake.direction !== 1) snake.direction = 3;
          break;
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    let animationFrameId: number;

    let frameCount = { current : 0};

    function gameLoop() {
      if (!ctx) return;

      // Clear screen each frame
      ctx.fillStyle = "mediumseagreen";
      ctx.fillRect(0, 0, screenWidth, screenHeight);

      
      const result = updateGameState(snake, apple, frameCount, ctx);

      snake = result.snake;
      stillRunning = result.stillRunning;
      apple = result.apple;

      if (!stillRunning) {
        setGameOver(true);
        drawApple(apple, ctx);
        drawSnake(snake, ctx);

        cancelAnimationFrame(animationFrameId);
        return;
      }

      frameCount.current++;
      animationFrameId = requestAnimationFrame(gameLoop);
    }

    gameLoop();

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      cancelAnimationFrame(animationFrameId);
    };
  }, [gameOver]);

  return (
    <div style={{ position: "relative" }}>
      <canvas ref={canvasRef} style={{ display: "block" }} />
      {gameOver && (
        <div
          style={{
            position: "absolute",
            top: "40%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
          }}
        >
          <h1>Game Over</h1>
          <button
            className="default-btn d-block mx-auto"
            onClick={() => setGameOver(false)}
            style={{ width: "150px", padding: "10px 20px", fontSize: "18px" }}
          >
            Restart
          </button>
          <button
            className="default-btn d-block mx-auto mt-2"
            onClick={() => navigate("/home")}
            style={{ width: "150px", padding: "10px 20px", fontSize: "18px" }}
          >
            Go Home
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
