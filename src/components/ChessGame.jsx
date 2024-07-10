import React, { useState } from "react";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ChessGame = () => {
  const [game, setGame] = useState(new Chess());
  const [turn, setTurn] = useState("w"); // 'w' for white, 'b' for black

//   const checkMandatoryCapture = (gameInstance, color) => {
//     const moves = gameInstance.moves({ verbose: true });
//     return moves.some(
//       (move) => move.color === color && move.flags.includes("c")
//     );
//   };

  const getCaptureMoves = (gameInstance, color) => {
    const moves = gameInstance.moves({ verbose: true });
    return moves.filter(
      (move) => move.color === color && move.flags.includes("c")
    );
  };

  const isValidMove = (piece, from, to) => {
    const [fromFile, fromRank] = [from[0], parseInt(from[1], 10)];
    const [toFile, toRank] = [to[0], parseInt(to[1], 10)];
    const fileDiff = toFile.charCodeAt(0) - fromFile.charCodeAt(0);
    const rankDiff = toRank - fromRank;

    switch (piece.type) {
      case "p": // Pawn
        if (piece.color === "w") {
          if (rankDiff === 1 && fileDiff === 0) return true; // Move one square forward
          if (rankDiff === 2 && fromRank === 2 && fileDiff === 0) return true; // Move two squares forward from start
          if (rankDiff === 1 && Math.abs(fileDiff) === 1) return true; // Capture diagonally
        } else {
          if (rankDiff === -1 && fileDiff === 0) return true; // Move one square forward
          if (rankDiff === -2 && fromRank === 7 && fileDiff === 0) return true; // Move two squares forward from start
          if (rankDiff === -1 && Math.abs(fileDiff) === 1) return true; // Capture diagonally
        }
        break;
      case "r": // Rook
        return fileDiff === 0 || rankDiff === 0; // Move in straight line
      case "n": // Knight
        return (
          (Math.abs(fileDiff) === 2 && Math.abs(rankDiff) === 1) ||
          (Math.abs(fileDiff) === 1 && Math.abs(rankDiff) === 2)
        ); // Move in "L" shape
      case "b": // Bishop
        return Math.abs(fileDiff) === Math.abs(rankDiff); // Move diagonally
      case "q": // Queen
        return (
          fileDiff === 0 ||
          rankDiff === 0 ||
          Math.abs(fileDiff) === Math.abs(rankDiff)
        ); // Move in straight line or diagonally
      case "k": // King
        return Math.abs(fileDiff) <= 1 && Math.abs(rankDiff) <= 1; // Move one square in any direction
      default:
        return false;
    }
  };

  const onMove = (sourceSquare, targetSquare) => {
    const piece = game.get(sourceSquare);
    if (!piece) {
      toast.error("No piece on the selected square.");
      return false;
    }
    if (piece.color !== turn) {
      toast.error("Not your turn. You cannot move this piece.");
      return false;
    }

    const newGame = new Chess(game.fen());
    const move = newGame.move({ from: sourceSquare, to: targetSquare });

    if (!move) {
      toast.error("Invalid move. Please try again.");
      return false;
    }

    if (!isValidMove(piece, sourceSquare, targetSquare)) {
      toast.error("Invalid move for this piece.");
      return false;
    }

    const mandatoryCaptures = getCaptureMoves(newGame, turn);
    if (mandatoryCaptures.length > 0 && !move.flags.includes("c")) {
      toast.error("Mandatory capture move available. You must capture.");
      return false;
    }

    setGame(newGame);
    setTurn(turn === "w" ? "b" : "w");
    toast.success(`Next turn: ${turn === "w" ? "Black" : "White"} moved.`);
    return true;
  };

  const handleQuit = () => {
    toast.info(`Player ${turn === "w" ? "Black" : "White"} wins!`);
    setGame(new Chess());
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex justify-between w-full p-4">
        <button
          disabled={turn !== "w"}
          className={`px-4 py-2 rounded ${turn === "w" ? "bg-green-500" : "bg-gray-800"} hover:bg-green-600 focus:outline-none`}
        >
          Player 1 (White)
        </button>
        <button
          disabled={turn !== "b"}
          className={`px-4 py-2 rounded ${turn === "b" ? "bg-green-500" : "bg-gray-800"} hover:bg-green-600 focus:outline-none`}
        >
          Player 2 (Black)
        </button>
      </div>
      <Chessboard
        position={game.fen()}
        onPieceDrop={(sourceSquare, targetSquare) =>
          onMove(sourceSquare, targetSquare)
        }
        boardStyle={{
          borderRadius: "5px",
          boxShadow: "0px 5px 15px rgba(0,0,0,0.3)",
        }}
      />
      <div className="mt-4">
        <button
          onClick={handleQuit}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 focus:outline-none"
        >
          Quit
        </button>
      </div>
      <ToastContainer />
    </div>
  );
};

export default ChessGame;
