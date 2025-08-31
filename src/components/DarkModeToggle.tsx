import React from "react";
import "../styles/DarkModeToggle.css";

type DarkModeToggleProps = {
  darkMode: boolean;
  toggleDarkMode: () => void;
};

const DarkModeToggle: React.FC<DarkModeToggleProps> = ({ darkMode, toggleDarkMode }) => {
  const switchClasses = `toggle-switch ${darkMode ? "dark" : "light"}`;

  return (
    <div className="dark-mode-toggle-container" onClick={toggleDarkMode}>
      <div className={switchClasses}>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-sun-fill sun" viewBox="0 0 16 16"><path d="M8 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8M8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0m0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13m-5-2.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5m10.5 0a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5m-10-8a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5m10.5 0a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5m-6.364 11.364a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707m9.193-9.193a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707m-9.193 0a.5.5 0 0 1 .707 0l1.414 1.414a.5.5 0 1 1-.707.707L3.05 3.757a.5.5 0 0 1 0-.707m9.193 9.193a.5.5 0 0 1 .707 0l1.414 1.414a.5.5 0 0 1-.707.707l-1.414-1.414a.5.5 0 0 1 0-.707"/></svg>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-moon-fill moon" viewBox="0 0 16 16"><path d="M6 .278a.77.77 0 0 1 .08.858 7.2 7.2 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277.527 0 1.04-.055 1.533-.16a.79.79 0 0 1 .81.316.73.73 0 0 1-.031.893A8.35 8.35 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.75.75 0 0 1 6 .278"/></svg>
      </div>
    </div>
  );
};

export default DarkModeToggle;