import React from "react";
import "../styles/DarkModeToggle.css";
import { BsSunFill, BsMoonFill } from "react-icons/bs";

type DarkModeToggleProps = {
  darkMode: boolean;
  toggleDarkMode: () => void;
};

const DarkModeToggle: React.FC<DarkModeToggleProps> = ({ darkMode, toggleDarkMode }) => {
  const containerClasses = `dark-mode-toggle-container ${darkMode ? "dark" : ""}`;
  const switchClasses = `toggle-switch ${darkMode ? "dark" : "light"}`;

  return (
    <button
      className={containerClasses}
      onClick={toggleDarkMode}
      aria-pressed={darkMode}
      aria-label="Toggle dark mode"
    >
      <div className={switchClasses}>
        <BsSunFill className="sun" />
        <BsMoonFill className="moon" />
      </div>
    </button>
  );
};

export default DarkModeToggle;