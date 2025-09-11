import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import TicTacToe from "./pages/TicTacToe";
import Sticks from "./pages/Sticks";
import Ultimate from "./pages/Ultimate";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/home" element={<Home />} />
      <Route path="/tictactoe" element={<TicTacToe />} />
      <Route path="/ultimate" element={<Ultimate />} />
      <Route path="/sticks" element={<Sticks />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
