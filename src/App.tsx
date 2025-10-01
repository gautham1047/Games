import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import { ThemeProvider } from "./context/ThemeContext";
import TicTacToe from "./pages/TicTacToe";
import Ultimate from "./pages/Ultimate";
import Sticks from "./pages/Sticks";
import Flappy from "./pages/Flappy";
import Snake from "./pages/Snake";
import MineSweeper from "./pages/MineSweeper";
import TwentyFortyEight from "./pages/TwentyFortyEight";
import Chess from "./pages/Chess";
import Test from "./pages/test";

function App() {
  return (
    <ThemeProvider>
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
        <Route path="/chess" element={<Chess />} />
        <Route path="/test" element={<Test />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;