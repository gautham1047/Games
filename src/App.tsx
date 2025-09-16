import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import TicTacToe from "./pages/TicTacToe";
import Sticks from "./pages/Sticks";
import Ultimate from "./pages/Ultimate";
import Flappy from "./pages/Flappy";


function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/home" element={<Home />} />
      <Route path="/tictactoe" element={<TicTacToe />} />
      <Route path="/ultimate" element={<Ultimate />} />
      <Route path="/sticks" element={<Sticks />} />
      <Route path="/flappy" element={<Flappy />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
