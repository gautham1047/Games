import React from "react";
import { useTheme } from "../context/ThemeContext";
import "../styles/GameUI.css";
import DarkModeToggle from "./DarkModeToggle";

/**
 * Defines the properties for a display indicator in the game panel.
 */
export interface Indicator {
  label: string;
  value: string | React.ReactNode;
  className?: string;
}

/**
 * Defines the properties for a button in the game panel footer.
 */
export interface Button {
  text: string;
  onClick: () => void;
  className?: string;
  disabled?: boolean;
}

interface GameUIProps {
  /** The title to be displayed at the top of the panel. */
  title: string;
  /** An array of indicators to display in the panel body. */
  indicators: Indicator[];
  /** An array of buttons to display in the panel footer. */
  buttons: Button[];
  /** Optional children to render inside the panel body. */
  additionalContent?: React.ReactNode;
}

/**
 * A reusable UI component for game information panels.
 * It provides a consistent structure with a header, body for indicators, and a footer for actions.
 */
const GameUI: React.FC<GameUIProps> = ({
  title,
  indicators,
  buttons,
  additionalContent,
}) => {
  const { darkMode } = useTheme();

  return (
    <div className={`game-panel ${darkMode ? "app-dark" : "app-light"}`}>
      <div className="game-panel-header">
        <h1 className="game-title">{title}</h1>
        <DarkModeToggle />
      </div>
      <div className="game-panel-body">
        {indicators.map((indicator, index) => (
          <div key={index} className={`turn-indicator ${indicator.className || ""}`}>
            {indicator.label}: {indicator.value}
          </div>
        ))}
        {additionalContent}
      </div>
      <div className="game-panel-footer">
        {buttons.map((button, index) => (
          <button
            key={index}
            className={`btn ${button.className || ""} w-100 ${
              index > 0 ? "mt-2" : ""
            }`}
            onClick={button.onClick}
            disabled={button.disabled}
          >
            {button.text}
          </button>
        ))}
      </div>
    </div>
  );
};

export default GameUI;