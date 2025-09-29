import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "../styles/App.css"; // Ensure this includes light/dark styles
import DarkModeToggle from "../components/DarkModeToggle";
import GameCard from "../components/GameCard";

export default function Home() {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);

  const appClass = darkMode ? "app-dark" : "app-light";

  const games = [
    {
      title: "Tic Tac Toe",
      description: "The classic game of noughts and crosses.",
      path: "/tictactoe",
      disabled: false,
    },
    {
      title: "Ultimate Tic Tac Toe",
      description: "A strategic twist on the classic game.",
      path: "/ultimate",
      disabled: false,
    },
    {
      title: "Sticks",
      description: "A simple game of strategy. Don't pick the last stick!",
      path: "/sticks",
      disabled: false,
    },
    {
      title: "Flappy Bird",
      description: "Endlessly dodge pipes by flapping!",
      path: "/flappy",
      disabled: false,
    },
    {
      title: "Snake",
      description: "Guide a growing snake and don't die!",
      path: "/snake",
      disabled: false,
    },
    {
      title: "Mine Sweeper",
      description: "Find the mines before they find you :)",
      path: "/minesweeper",
      disabled: false,
    }, 
    {
      title: "2048",
      description: "Combine tiles to reach 2048!",
      path: "/2048",
      disabled: false,
    }, 
    {
      title: "Chess",
      description: "The classic game of strategy and skill.",
      path: "/chess",
      disabled: false,
    },
    {
      title: "Other Games",
      description: "More exciting games are on the way!",
      path: "/other",
      disabled: true,
    },
  ];

  return (
    <div className={appClass} style={{ minHeight: "100vh" }}>
      <div className="container py-5 d-flex flex-column align-items-center">
        <div className="position-absolute" style={{ top: "1rem", right: "1rem" }}>
          <DarkModeToggle darkMode={darkMode} toggleDarkMode={() => setDarkMode(!darkMode)} />
        </div>

        <h1 className="text-center mb-4 mt-3 display-4 fw-bold">Games</h1>

        <div className="row g-4 justify-content-center">
          {games.map((game) => (
            <div className="col-12 col-sm-8 col-md-6 col-lg-4" key={game.title}>
              <GameCard
                title={game.title}
                description={game.description}
                onClick={() => !game.disabled && navigate(game.path)}
                disabled={game.disabled}
                darkMode={darkMode}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
