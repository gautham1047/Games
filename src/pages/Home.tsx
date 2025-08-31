import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "../styles/App.css"; // Ensure this includes light/dark styles
import DarkModeToggle from "../components/DarkModeToggle";

export default function Home() {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);

  const appClass = darkMode ? "app-dark" : "app-light";
  const defaultBtnClass = `btn ${
    darkMode ? "btn-outline-light" : "btn-outline-dark"
  } default-btn`;

  return (
    <div className={appClass} style={{ minHeight: "100vh" }}>
      <div className="container py-5 d-flex flex-column align-items-center justify-content-center">
        <div className="position-absolute" style={{ top: "1rem", right: "1rem" }}>
          <DarkModeToggle darkMode={darkMode} toggleDarkMode={() => setDarkMode(!darkMode)} />
        </div>

        <h1 className="text-center mb-5 mt-3">Games</h1>

        <button
          onClick={() => navigate("/tictactoe")}
          className={`${defaultBtnClass} mb-3`}
        >
          Play Tic Tac Toe
        </button>

        <button
          onClick={() => navigate("/ultimate")}
          className={`${defaultBtnClass} mb-3`}
          disabled
        >
          Ultimate Tic Tac Toe (Coming Soon)
        </button>

        <button
          onClick={() => navigate("/sticks")}
          className={`${defaultBtnClass} mb-3`}
        >
          Play Sticks
        </button>

        <button
          onClick={() => navigate("/other")}
          className={`${defaultBtnClass}`}
          disabled
        >
          Other Games (Coming Soon)
        </button>
      </div>
    </div>
  );
}
