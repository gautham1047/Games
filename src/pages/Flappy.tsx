import { useRef, useEffect, useState } from "react";
import "../styles/Flappy.css";
import "../styles/App.css";
import GameOverCard from "../components/gameOverCard";
import { useTheme } from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";

interface Bird {
  x: number;
  y: number;
  velocity: number;
  dead?: boolean;
  jumpQueued: boolean;
}

interface Pipe {
  x: number;
  gapTop: number;
}

const App = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const screenWidth = document.documentElement.clientWidth;
  const screenHeight = document.documentElement.clientHeight;

  const pipeWidth = 50;
  const gapHeight = 200;

  const birdSize = 50;

  const gravity = 0.06;
  const jumpPower = -4;

  const startScrollSpeed = 4;
  const endScrollSpeed = 10;
  const rampUpRate = 0.025 / 60;
  const scrollSpace = 800;

  const [gameOver, setGameOver] = useState(false);

  const navigate = useNavigate();
  const { darkMode } = useTheme();

  function drawBird(bird: Bird, ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "yellow";
    ctx.fillRect(bird.x, bird.y, birdSize, birdSize);

    if (bird.dead) {
      ctx.strokeStyle = "black";
      ctx.lineWidth = 3;

      // first diagonal
      ctx.beginPath();
      ctx.moveTo(bird.x + birdSize / 2, bird.y + birdSize / 2);
      ctx.lineTo(bird.x + birdSize * 0.9, bird.y + birdSize * 0.1);
      ctx.stroke();

      // second diagonal
      ctx.beginPath();
      ctx.moveTo(bird.x + birdSize * 0.9, bird.y + birdSize / 2);
      ctx.lineTo(bird.x + birdSize / 2, bird.y + birdSize * 0.1);
      ctx.stroke();
    }
  }

  function drawPipe(pipe: Pipe, ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "green";
    ctx.fillRect(pipe.x, 0, pipeWidth, pipe.gapTop);

    ctx.fillRect(
      pipe.x,
      pipe.gapTop + gapHeight,
      pipeWidth,
      screenHeight - (pipe.gapTop + gapHeight)
    );
  }

  function drawPipes(pipes: Pipe[], ctx: CanvasRenderingContext2D) {
    pipes.forEach((pipe) => {
      drawPipe(pipe, ctx);
    });
  }

  function spawnPipe(pipes: Pipe[]) {
    const newPipe: Pipe = {
      x: screenWidth - pipeWidth,
      gapTop:
        Math.random() * (screenHeight - 1.75 * gapHeight) + 0.75 * gapHeight,
    };
    pipes.push(newPipe);
  }

  function draw(bird: Bird, pipes: Pipe[], ctx: CanvasRenderingContext2D) {
    drawPipes(pipes, ctx);
    drawBird(bird, ctx);
  }

  function updateGameState(
    bird: Bird,
    pipes: Pipe[],
    ctx: CanvasRenderingContext2D,
    frameCount: React.MutableRefObject<number>,
    scrollSpeed: React.MutableRefObject<number>
  ): boolean {
    bird.velocity += gravity;
    bird.y += bird.velocity;

    if (bird.jumpQueued) {
      bird.velocity = jumpPower;
      bird.jumpQueued = false;
    }

    if (scrollSpeed.current < endScrollSpeed) scrollSpeed.current += rampUpRate;

    const actualSpace = Math.floor(scrollSpace / scrollSpeed.current);

    frameCount.current++;

    if (frameCount.current % actualSpace === 0) {
      spawnPipe(pipes);
    }

    pipes.forEach((pipe) => {
      pipe.x -= scrollSpeed.current;
    });

    draw(bird, pipes, ctx);

    if (bird.y < 0 || bird.y > screenHeight - birdSize) {
      return false;
    }

    for (const pipe of pipes) {
      if (pipe.x < bird.x + birdSize && pipe.x + pipeWidth > bird.x) {
        if (
          bird.y < pipe.gapTop ||
          bird.y + birdSize > pipe.gapTop + gapHeight
        ) {
          return false;
        }
      }
    }

    return true;
  }

  useEffect(() => {
    // Don't run game logic if the game is over
    if (gameOver) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = screenWidth;
    canvas.height = screenHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // draw background
    ctx.fillStyle = "skyblue";
    ctx.fillRect(0, 0, screenWidth, screenHeight);

    const bird = {
      x: screenWidth / 4,
      y: screenHeight / 2,
      velocity: 0,
      dead: false,
      jumpQueued: false,
    };

    const pipes = {
      current: [{ x: screenWidth * 0.8, gapTop: screenHeight * 0.4 }],
    };

    const frameCount = { current: 0 };
    const scrollSpeed = { current: startScrollSpeed };

    let animationFrameId: number;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.code === "Space") {
        bird.jumpQueued = true;
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    function gameLoop() {
      if (!ctx) return;
      
      ctx.fillStyle = "skyblue";
      ctx.fillRect(0, 0, screenWidth, screenHeight);

      const stillRunning = updateGameState(
        bird,
        pipes.current,
        ctx,
        frameCount,
        scrollSpeed
      );
      pipes.current = pipes.current.filter((pipe) => pipe.x > -pipeWidth);

      if (!stillRunning) {
        bird.dead = true;
        // Animate the fall
        const fallLoop = () => {
          bird.velocity += gravity * 2;
          bird.y += bird.velocity;
          ctx.fillStyle = "skyblue";
          ctx.fillRect(0, 0, screenWidth, screenHeight);
          draw(bird, pipes.current, ctx);
          if (bird.y < screenHeight) {
            requestAnimationFrame(fallLoop);
          } else {
            setGameOver(true);
          }
        };
        fallLoop();
        return;
      }

      animationFrameId = requestAnimationFrame(gameLoop);
    }

    gameLoop();

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      cancelAnimationFrame(animationFrameId);
    };
  }, [gameOver]); // Rerun useEffect when gameOver state changes

  return (
    <div style={{ position: "relative" }}>
      <canvas ref={canvasRef} style={{ display: "block" }} />
      {gameOver && <GameOverCard
        onRestart={() => setGameOver(false)}
        onGoHome={() => navigate("/home")}
        darkMode={darkMode}
      />}
    </div>
  );
};

export default App;
