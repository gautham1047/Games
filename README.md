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
| **Sticks**              | A simple game of strategy. Don't pick the last stick! | Multiplayer ready |
| **Flappy Bird**         | Endlessly dodge pipes by flapping!                  | Single Player     |
| **Snake**               | Guide a growing snake and don't die!                | Single Player     |
| **Minesweeper**         | Find the mines before they find you.                | Single Player     |
| **2048**                | Combine tiles to reach 2048!                        | Single Player     |
| **Chess**               | The classic game of strategy and skill.             | Single Player     |
| **Tic Tac Toe**         | Under Maintainance                                  | Multiplayer ready |
| **Ultimate Tic Tac Toe**| Under Maintainance                                  | Single Player     |


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

- Add more games to the collection.
- Add computer bots to play against for games like Chess and Ultimate Tic-Tac-Toe
- Improve UI (and implement more mobile UI since it is currenlty inconsistent)


