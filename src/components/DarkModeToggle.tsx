import React from "react";
import { useTheme } from "../context/ThemeContext";
import "../styles/DarkModeToggle.css";
import { FaSun, FaMoon } from "react-icons/fa";

const DarkModeToggle: React.FC = () => {
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <button onClick={toggleDarkMode} className={`dark-mode-toggle-container ${darkMode ? "dark" : ""}`} aria-label="Toggle dark mode">
      <div className={`toggle-switch ${darkMode ? "dark" : "light"}`}>
        <FaSun className="sun" />
        <FaMoon className="moon" />
      </div>
    </button>
  );
};

export default DarkModeToggle;