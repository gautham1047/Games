import { useState, useEffect, useRef } from "react";
import ChessBoard from "../components/ChessBoard";
import "../styles/App.css";
import "../styles/Chess.css";
import { useNavigate } from "react-router-dom";
import type { Piece, Board } from "../assets/chess";
import { chessPieces } from "../assets/chessPieces";
import { useTheme } from "../context/ThemeContext";
import GameUI from "../components/gameUI";
import type { Button, Indicator } from "../components/gameUI";

function ChessPage() {
  const navigate = useNavigate();
  const [board, setBoard] = useState<Board>([]);
  const [selectedPiece, setSelectedPiece] = useState<[number, number] | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<[number, number][]>([]);
  const [turn, setTurn] = useState<"w" | "b">("w");
  const [checkMate, setCheckMate] = useState(false);
  const [enPassantTarget, setEnPassantTarget] = useState<[number, number] | null>(null);
  const [promotionSquare, setPromotionSquare] = useState<[number, number] | null>(null);

  const { darkMode } = useTheme();

  const kingMoved = useRef(false);
  const castlingSide = useRef<"kingside" | "queenside" | null>(null);

  useEffect(() => {
    const initialBoard: Board = Array(8)
      .fill(null)
      .map(() => Array(8).fill(null));

    // Initialize pieces
    const pieceOrder: Piece["type"][] = [
      "rook",
      "knight",
      "bishop",
      "queen",
      "king",
      "bishop",
      "knight",
      "rook",
    ];

    // Place black pieces
    for (let i = 0; i < 8; i++) {
      initialBoard[0][i] = { type: pieceOrder[i], color: "b", position: [0, i] } as Piece;
      initialBoard[1][i] = { type: "pawn", color: "b", position: [1, i] };
    } 

    // Place white pieces
    for (let i = 0; i < 8; i++) {
      initialBoard[6][i] = { type: "pawn", color: "w", position: [6, i] };
      initialBoard[7][i] = { type: pieceOrder[i], color: "w", position: [7, i] } as Piece;
    }
    setBoard(initialBoard);
  }, []);

  const canCapture = (from: Piece, to: [number, number] | null): boolean => {
    if (to === null) return false;
    const targetPiece = board[to[0]][to[1]];
    // Can only capture if a piece exists and it's of the opposite color
    return targetPiece !== null && from.color !== targetPiece.color;
  };

  const legalPawnMoves = (piece: Piece): [number, number][] => {
    const moves: [number, number][] = [];
    const [row, col] = piece.position;
    const direction = piece.color === "w" ? -1 : 1;
    const newRow = row + direction;

    // Move forward
      if (newRow >= 0 && newRow < 8 && !board[newRow][col]) {
        moves.push([newRow, col]);
      }

      // Capture diagonally
      const captureCols = [col - 1, col + 1];
      for (const c of captureCols) {
        if (c >= 0 && c < 8 && canCapture(piece, [newRow, c])) {
          moves.push([newRow, c]);
        }
      }

      // Initial double move
      if ((piece.color === "w" && row === 6) || (piece.color === "b" && row === 1)) {
        const doubleRow = row + 2 * direction;
        if (!board[newRow][col] && !board[doubleRow][col]) {
          moves.push([doubleRow, col]);
        }
      }

      // En passant capture
      if (enPassantTarget) {
        const [epRow, epCol] = enPassantTarget;
        // The capturing pawn must be on the 5th rank (for white) or 4th rank (for black)
        if (newRow === epRow && (col - 1 === epCol || col + 1 === epCol)) {
          moves.push([epRow, epCol]);
        }
      }

      return moves;
    };

    const legalKnightMoves = (piece: Piece): [number, number][] => {
      const moves: [number, number][] = [];
      const [row, col] = piece.position;
      const knightMoves = [
        [2, 1], [2, -1], [-2, 1], [-2, -1],
        [1, 2], [1, -2], [-1, 2], [-1, -2]
      ];

      for (const [dx, dy] of knightMoves) {
        const newRow = row + dx;
        const newCol = col + dy;
        if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
          if (!board[newRow][newCol] || canCapture(piece, [newRow, newCol])) moves.push([newRow, newCol]);
        }
      }

      return moves;
    };

    const legalBishopMoves = (piece: Piece): [number, number][] => {
      const moves: [number, number][] = [];
      const [row, col] = piece.position;
      const directions = [
        [1, 1], [1, -1], [-1, 1], [-1, -1] // diagonals
      ];

      for (const [dx, dy] of directions) {
        let newRow = row + dx;
        let newCol = col + dy;
        while (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
          if (board[newRow][newCol]) {
            if (canCapture(piece, [newRow, newCol])) {
              moves.push([newRow, newCol]);
            }
            break;
          }
          moves.push([newRow, newCol]);
          newRow += dx;
          newCol += dy;
        }
      }

      return moves;
    };

    const legalRookMoves = (piece: Piece): [number, number][] => {
      const moves: [number, number][] = [];
      const [row, col] = piece.position;
      const directions = [
        [0, 1], [0, -1], [1, 0], [-1, 0] // right, left, down, up
      ]; 

      for (const [dx, dy] of directions) {
        let newRow = row + dx;
        let newCol = col + dy;
        while (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
          if (board[newRow][newCol]) {
            if (canCapture(piece, [newRow, newCol])) {
              moves.push([newRow, newCol]);
            }
            break;
          }

          moves.push([newRow, newCol]);

          newRow += dx;
          newCol += dy;
        }
      }

      return moves;
    };

    const legalQueenMoves = (piece: Piece): [number, number][] => {
      return [...legalBishopMoves(piece), ...legalRookMoves(piece)];
    };

    const kingRawMoves = (piece: Piece): [number, number][] => {
      const moves: [number, number][] = [];
      const [row, col] = piece.position;
      const directions = [
        [0, 1], [0, -1], [1, 0], [-1, 0], // right, left, down, up
        [1, 1], [1, -1], [-1, 1], [-1, -1] // diagonals
      ];

      for (const [dx, dy] of directions) {
        const newRow = row + dx;
        const newCol = col + dy;
        if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
          moves.push([newRow, newCol]);
        }
      }
      return moves;
    }

    const legalPieceMoves = (piece: Piece): [number, number][] => {
      if (piece.type === "king") return kingRawMoves(piece);

      if (piece.type === "pawn") return legalPawnMoves(piece);
      if (piece.type === "knight") return legalKnightMoves(piece);
      if (piece.type === "bishop") return legalBishopMoves(piece);
      if (piece.type === "rook") return legalRookMoves(piece);
      if (piece.type === "queen") return legalQueenMoves(piece);

      return [];
    }

    const isCheck = (king : Piece, to: [number, number] | null, board : Board) : Piece | boolean=> {
      const [kingRow, kingCol] = to ? to : king.position;
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          const piece = board[r][c];
          if (piece && piece.color !== king.color) {
            const moves = legalPieceMoves(piece);

            // pawns capture different than they move (logic for stopping king from going into check)
            if (piece.type == "pawn") {
              const direction = piece.color === "w" ? -1 : 1;
              const attackRow = piece.position[0] + direction;
              const attackCols = [piece.position[1] - 1, piece.position[1] + 1];

              for (const c of attackCols) {
                if (c >= 0 && c < 8 && attackRow === kingRow && c === kingCol) return piece;
              }
            }

            // all other pieces are easy to handle
            if (moves.some(([mr, mc]) => mr === kingRow && mc === kingCol)) return piece;
          }
          }
      }

      return false;
    };

    const legalKingMoves = (piece: Piece): [number, number][] => {
      const moves: [number, number][] = [];
      const [row, col] = piece.position;
      const directions = [
        [0, 1], [0, -1], [1, 0], [-1, 0], // right, left, down, up
        [1, 1], [1, -1], [-1, 1], [-1, -1] // diagonals
      ];

      for (const [dx, dy] of directions) {
        const newRow = row + dx;
        const newCol = col + dy;
        if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
          if ((!board[newRow][newCol] || canCapture(piece, [newRow, newCol])) && !isCheck(piece, [newRow, newCol], board)) {
            moves.push([newRow, newCol]);
          }
        }
      }

      if (!kingMoved.current) {
        // Kingside castling
        if (board[row][col + 1] === null && board[row][col + 2] === null && board[row][col + 3]?.type === "rook" && board[row][col + 3]?.color === piece.color) {
          if (!isCheck(piece, [row, col + 2], board)) {
            moves.push([row, col + 2]);
          } 
        }

        // Queenside castling
        if (board[row][col - 1] === null && board[row][col - 2] === null && board[row][col - 3] === null && board[row][col - 4]?.type === "rook" && board[row][col - 4]?.color === piece.color) {
          if (!isCheck(piece, [row, col - 2], board)) {
            moves.push([row, col - 2]);
          }
        }
      }

      return moves;
    };

    const findKing = (): Piece => {
      return board.flat().find(p => p?.type === 'king' && p.color === turn) as Piece;
    }

    const isCheckmate = () : boolean => {
      const king = findKing(); 
      if (!king || !isCheck(king, null, board)) {
        return false;
      }

      // check for any legal moves
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          const piece = board[r][c];
          if (piece && piece.color === turn) {
            // Generate all pseudo-legal moves for this piece.
            const moves = piece.type === 'king' ? legalKingMoves(piece) : legalPieceMoves(piece);

            // For each move, check if it gets the king out of check.
            for (const move of moves) {
              const [newRow, newCol] = move;
              const [oldRow, oldCol] = piece.position;

              // Simulate the move on a temporary board.
              const tempBoard = board.map(row => row.slice());
              tempBoard[newRow][newCol] = { ...piece, position: [newRow, newCol] };
              tempBoard[oldRow][oldCol] = null;
              const kingOnTempBoard = (piece.type === 'king') ? tempBoard[newRow][newCol] : king;

              // If we found a move that results in the king NOT being in check, it's not checkmate.
              if (!isCheck(kingOnTempBoard, null, tempBoard)) {
                return false;
              }
            }
          }
        }
      }

      return true;
    }

    const initializeBoard = (): Board => {
      const initialBoard: Board = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null));

      const pieceOrder: Piece["type"][] = ["rook", "knight", "bishop", "queen", "king", "bishop", "knight", "rook"];

      for (let i = 0; i < 8; i++) {
        initialBoard[0][i] = { type: pieceOrder[i], color: "b", position: [0, i] } as Piece;
        initialBoard[1][i] = { type: "pawn", color: "b", position: [1, i] };
        initialBoard[6][i] = { type: "pawn", color: "w", position: [6, i] };
        initialBoard[7][i] = { type: pieceOrder[i], color: "w", position: [7, i] } as Piece;
      }
      return initialBoard;
    };

    const resetGame = () => {
      setBoard(initializeBoard());
      setSelectedPiece(null);
      setPossibleMoves([]);
      setTurn("w");
      setCheckMate(false);
      kingMoved.current = false;
      setPromotionSquare(null);
      setEnPassantTarget(null);
      castlingSide.current = null;
    };

    // This effect will run after the board or turn changes.
    useEffect(() => {
      if (board.length > 0) { // Ensure the board is initialized before checking
        setCheckMate(isCheckmate());
      }
    }, [board, turn]);

    const legalMoves = (piece: Piece): [number, number][] => {
      const king = findKing();
      if (!king) throw new Error("No king found");

      const pseudoLegalMoves = piece.type === 'king' ? legalKingMoves(piece) : legalPieceMoves(piece);

      const filteredMoves = pseudoLegalMoves.filter(move => {
        const [newRow, newCol] = move;
        const [oldRow, oldCol] = piece.position;

        const tempBoard = board.map(row => row.slice());
        tempBoard[newRow][newCol] = { ...piece, position: [newRow, newCol] };
        tempBoard[oldRow][oldCol] = null;

        const kingOnTempBoard = (piece.type === 'king') ? tempBoard[newRow][newCol] : king;

        return !isCheck(kingOnTempBoard, null, tempBoard);
      });

      return filteredMoves;
    };

  const onSquareClick = (row: number, col: number) => {
    if (selectedPiece) {
      // Move piece logic
      const [selRow, selCol] = selectedPiece;
      const piece = board[selRow][selCol];
      if (piece) {        
        if (!possibleMoves.some(([r, c]) => r === row && c === col)) {
          // Invalid move, deselect piece
          setSelectedPiece(null);
          setPossibleMoves([]);
          return;
        }

        // If a promotion is pending, don't allow other moves.
        if (promotionSquare) return;

        // Check for pawn promotion
        if (piece.type === 'pawn' && (row === 0 || row === 7)) {
          const newBoard = board.map((r) => r.slice());
          newBoard[row][col] = { ...piece, position: [row, col] };
          newBoard[selRow][selCol] = null;
          setBoard(newBoard);
          setPromotionSquare([row, col]);
          setSelectedPiece(null);
          setPossibleMoves([]);
          return; // Pause game until promotion is selected
        }

        let nextEnPassantTarget: [number, number] | null = null;

        const newBoard = board.map((r) => r.slice());
        newBoard[row][col] = { ...piece, position: [row, col] };
        newBoard[selRow][selCol] = null;

        // En Passant capture logic
        if (piece.type === 'pawn' && enPassantTarget && row === enPassantTarget[0] && col === enPassantTarget[1]) {
          const capturedPawnRow = row + (piece.color === 'w' ? 1 : -1);
          newBoard[capturedPawnRow][col] = null; // Remove the captured pawn
        }

        // Set up for next turn's en passant
        if (piece.type === 'pawn' && Math.abs(row - selRow) === 2) {
          nextEnPassantTarget = [selRow + (piece.color === 'w' ? -1 : 1), selCol];
        }

        // Handle castling rook move
        if (piece.type === "king") {
          const movedTwoSquares = Math.abs(col - selCol) === 2;
          if (movedTwoSquares && !kingMoved.current) {
            if (col > selCol) { // Kingside
              const rook = newBoard[row][7];
              newBoard[row][5] = { ...rook!, position: [row, 5] };
              newBoard[row][7] = null;
            } else { // Queenside
              const rook = newBoard[row][0];
              newBoard[row][3] = { ...rook!, position: [row, 3] };
              newBoard[row][0] = null;
            }
          }
          kingMoved.current = true;
        }

        setBoard(newBoard);
        setSelectedPiece(null);
        setPossibleMoves([]);
        setEnPassantTarget(nextEnPassantTarget);
        setTurn(turn === "w" ? "b" : "w");
      }
    }
    else {
      // Select piece logic
      const piece = board[row][col];
      if (piece && piece.color === turn) {
        setSelectedPiece([row, col]);
        setPossibleMoves(legalMoves(piece));
      }
    }
  }

  const handlePromotion = (pieceType: "queen" | "rook" | "bishop" | "knight") => {
    if (!promotionSquare) return;

    const [promoRow, promoCol] = promotionSquare;
    const newBoard = board.map(row => row.slice());
    const promotingPawn = newBoard[promoRow][promoCol];

    if (promotingPawn) {
      newBoard[promoRow][promoCol] = {
        ...promotingPawn,
        type: pieceType,
      };

      setBoard(newBoard);
      setPromotionSquare(null);
      setTurn(turn === "w" ? "b" : "w");
    }
  };

  const gameIndicators: Indicator[] = [
    {
      label: "Turn",
      value: turn === "w" ? "White" : "Black",
      className: turn === "w" ? "white-turn" : "black-turn",
    },
  ];

  const gameButtons: Button[] = [
    {
      text: "Reset Game",
      onClick: resetGame,
      className: darkMode ? "btn-light" : "btn-dark",
    },
    { text: "Go Home", onClick: () => navigate("/home"), className: "btn-secondary" },
  ];

  return (
    <div className={`chess-page-container ${darkMode ? "app-dark" : "app-light"}`}>
      <div className="game-container">
        <div className="chessboard-container">
          {/* Promotion UI */}
          {promotionSquare && (
            <div className="promotion-overlay" style={{
              top: promotionSquare[0] < 4 ? `${promotionSquare[0] * 12.5}%` : "auto",
              bottom: promotionSquare[0] >= 4 ? `${(7 - promotionSquare[0]) * 12.5}%` : "auto",
              left: `${promotionSquare[1] * 12.5}%`,
              flexDirection: promotionSquare[0] < 4 ? "column" : "column-reverse"
            }}>
              {(["queen", "rook", "bishop", "knight"] as const).map((pieceType) => (
                <div key={pieceType} className="promotion-piece" onClick={() => handlePromotion(pieceType)}>
                  <img src={chessPieces[`${pieceType}_${turn}`]} alt={pieceType} />
                </div>
              ))}
            </div>
          )}
          <ChessBoard
            board={board}
            selected={selectedPiece}
            onSquareClick={onSquareClick}
            activeSquares={possibleMoves}
            darkMode={darkMode}
          />
          {checkMate && (
            <div className="game-over-overlay">
              <div className="game-over-box">
                <h2>Checkmate!</h2>
                <p>{turn === "w" ? "Black" : "White"} wins!</p>
                <button className="btn btn-primary mt-3" onClick={resetGame}>
                  Play Again
                </button>
              </div>
            </div>
          )}
        </div>
        <GameUI title="Chess" indicators={gameIndicators} buttons={gameButtons} />
      </div>
    </div>
  );
}

export default ChessPage;