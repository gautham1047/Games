import React from "react";
import "../styles/App.css";
import "../styles/gameOverCard.css";

interface DifficultyOption {
  label: string;
  value: string;
  colorClass: string; // e.g., 'btn-outline-success'
}

interface GameOverCardProps {
  onRestart: () => void;
  onGoHome: () => void;
  darkMode: boolean;
  difficultyOptions?: DifficultyOption[];
  currentDifficulty?: string;
  onDifficultyChange?: (difficulty: string) => void;
  title?: string;
}

const GameOverCard: React.FC<GameOverCardProps> = ({
  onRestart,
  onGoHome,
  darkMode,
  difficultyOptions,
  currentDifficulty,
  onDifficultyChange,
  title = "Game Over",
}) => {
  const cardThemeClass = darkMode ? "dark" : "light";

  return (
    <div className="game-over-card-overlay">
      <div className={`game-over-card ${cardThemeClass}`}>
        <h1 className="fw-bold mb-4">{title}</h1>

        {difficultyOptions && currentDifficulty && onDifficultyChange && (
          <div className="difficulty-controls mt-3 mb-4">
            <div
              className="btn-group"
              role="group"
              aria-label="Difficulty settings"
            >
              {difficultyOptions.map((option) => (
                <React.Fragment key={option.value}>
                  <input
                    type="radio"
                    className="btn-check"
                    name="difficulty"
                    id={`difficulty-${option.value}`}
                    autoComplete="off"
                    checked={currentDifficulty === option.value}
                    onChange={() => onDifficultyChange(option.value)}
                  />
                  <label className={`btn ${option.colorClass}`} htmlFor={`difficulty-${option.value}`}>
                    {option.label}
                  </label>
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        <button
          className="btn btn-game-over w-100 mb-2"
          onClick={onRestart}
          style={{ padding: "10px 20px", fontSize: "18px" }}
        >
          Restart
        </button>
        <button className="btn btn-secondary w-100" onClick={onGoHome} style={{ padding: "10px 20px", fontSize: "18px" }}>
          Go Home
        </button>
      </div>
    </div>
  );
};

export default GameOverCard;