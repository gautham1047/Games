<div align="center">
  <h1 align="center">React Web Games</h1>
  <p align="center">
    A collection of classic and fun browser-based games built with React, TypeScript, and Vite.
    <br />
    This project serves as a showcase of different game logic implementations within a modern web application structure.
  </p>
</div>

<!-- You can add a screenshot of your home page here! -->
<!-- ![Project Screenshot](placeholder.png) -->

---

## Games

This arcade features a variety of games, each implemented as a separate React component.

| Game                    | Description                                         | Features          |
| ----------------------- | --------------------------------------------------- | ----------------- |
| **Tic Tac Toe**         | The classic game of noughts and crosses.            | Multiplayer ready |
| **Ultimate Tic Tac Toe**| A strategic twist on the classic game.              | Single Player     |
| **Sticks**              | A simple game of strategy. Don't pick the last stick! | Multiplayer ready |
| **Flappy Bird**         | Endlessly dodge pipes by flapping!                  | Single Player     |
| **Snake**               | Guide a growing snake and don't die!                | Single Player     |
| **Minesweeper**         | Find the mines before they find you.                | Single Player     |
| **2048**                | Combine tiles to reach 2048!                        | Single Player     |
| **Chess**               | The classic game of strategy and skill.             | Single Player     |

## ✨ Features

- **Multiple Games**: A growing collection of interactive games.
- **Dark Mode**: A sleek dark mode toggle for comfortable viewing.
- **Multiplayer Support**: Some games like Tic Tac Toe and Sticks are built with WebSocket-based multiplayer functionality.
- **Responsive Design**: Using Bootstrap, the layout adapts to different screen sizes.
- **Client-Side Routing**: Smooth navigation between the home page and games using React Router.

## 🛠️ Tech Stack

- **Framework**: [React](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Routing**: [React Router](https://reactrouter.com/)
- **Styling**: [Bootstrap](https://getbootstrap.com/) & Custom CSS
- **Linting**: [ESLint](https://eslint.org/)

## 🚀 Getting Started

### Prerequisites

Make sure you have Node.js installed (version 18.x or higher is recommended).

### Installation

1.  Clone the repository:
    ```sh
    git clone <your-repository-url>
    ```
2.  Navigate to the project directory:
    ```sh
    cd Games
    ```
3.  Install the dependencies:
    ```sh
    npm install
    ```

## 📜 Available Scripts

In the project directory, you can run:

### `npm run dev`

Runs the app in development mode. Open http://localhost:5173 to view it in your browser. The page will automatically reload if you make edits.

### `npm run build`

Builds the app for production to the `dist` folder. It correctly bundles React in production mode and optimizes the build for the best performance.

### `npm run lint`

Lints the project files for code quality and style issues.

### `npm run preview`

Runs a local server to preview the production build from the `dist` folder.

## Project Structure

The project is organized as follows:

```
src
├── assets/         # Static assets like images or chess piece SVGs
├── components/     # Reusable components (Board, GameCard, DarkModeToggle, etc.)
├── pages/          # Each game has its own page component
│   ├── Home.tsx
│   ├── TicTacToe.tsx
│   └── ...
├── styles/         # CSS files for global and component-specific styles
├── App.tsx         # Main application component with routing setup
└── main.tsx        # Application entry point
```

## Future Improvements

- Implement the backend for the multiplayer WebSocket connections.
- Add more games to the collection.
- Add computer bots to play against for games like Chess and Ultimate Tic-Tac-Toe
- Add unit and integration tests for game logic.


