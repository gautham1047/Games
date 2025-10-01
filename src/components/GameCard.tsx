import React from "react";
import "../styles/GameCards.css";
import { IoGameControllerOutline } from "react-icons/io5";

interface GameCardProps {
  title: string;
  description: string;
  onClick: () => void;
  disabled?: boolean;
  darkMode: boolean;
}

const GameCard: React.FC<GameCardProps> = ({
  title,
  description,
  onClick,
  disabled = false,
  darkMode,
}) => {
  const cardClass = `card h-100 text-center game-card ${
    darkMode ? "bg-dark text-white border-secondary" : "card-bg-beige border-beige"
  } ${disabled ? "disabled" : ""}`;

  const btnClass = `btn ${
    darkMode ? "btn-outline-info" : "btn-outline-beige"
  } align-self-center d-flex align-items-center`;

  return (
    <div className={cardClass} onClick={!disabled ? onClick : undefined}>
      <div className={`card-body d-flex flex-column ${!darkMode ? "text-brown" : ""}`}>
        <h5 className="card-title fw-bold ">{title}</h5>
        <p className="card-text flex-grow-1">{description}</p>
        <button
          onClick={onClick}
          className={btnClass}
          disabled={disabled}
          style={{ gap: "0.5rem" }}
        >
          {disabled ? "Coming Soon" : <><IoGameControllerOutline /> Play Now</>}
        </button>
      </div>
    </div>
  );
};

export default GameCard;