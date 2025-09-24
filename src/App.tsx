import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import TicTacToe from "./pages/TicTacToe";
import Sticks from "./pages/Sticks";
import Ultimate from "./pages/Ultimate";
import Flappy from "./pages/Flappy";
import Snake from "./pages/Snake";
import MineSweeper from "./pages/MineSweeper";
import TwentyFortyEight from "./pages/TwentyFortyEight";


function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/home" element={<Home />} />
      <Route path="/tictactoe" element={<TicTacToe />} />
      <Route path="/ultimate" element={<Ultimate />} />
      <Route path="/sticks" element={<Sticks />} />
      <Route path="/flappy" element={<Flappy />} />
      <Route path="/snake" element={<Snake />} />
      <Route path="/minesweeper" element={<MineSweeper />} />
      <Route path="/2048" element={<TwentyFortyEight />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
