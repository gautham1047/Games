import { useEffect, useState, useRef } from "react";

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
    ctx: CanvasRenderingContext2D
  ): {snake : Snake, stillRunning : boolean} {
    const newSnake = moveSnake(snake);

    drawSnake(newSnake, ctx);
    drawApple(apple, ctx);

    return {snake : newSnake, stillRunning : true};
  }

  useEffect(() => {
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
          snake.direction = 0;
          break;
        case "w":
        case "ArrowUp":
          snake.direction = 1;
          break;
        case "d":
        case "ArrowRight":
          snake.direction = 2;
          break;
        case "s":
        case "ArrowDown":
          snake.direction = 3;
          break;
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    let animationFrameId: number;

    function gameLoop() {
      if (!ctx) return;

      // Clear screen each frame
      ctx.fillStyle = "mediumseagreen";
      ctx.fillRect(0, 0, screenWidth, screenHeight);

      const result = updateGameState(snake, apple, ctx);

      snake = result.snake;
      stillRunning = result.stillRunning;

      if (!stillRunning) {
        cancelAnimationFrame(animationFrameId);
        return;
      }

      animationFrameId = requestAnimationFrame(gameLoop);
    }

    gameLoop();

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} style={{ display: "block" }} />;
}

export default App;
