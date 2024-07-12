import React, { useState, useEffect, useRef } from "react";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import moveSound from "./game-end.mp3";
import captureSound from "./capture.mp3";

const ChessGame = () => {
  const [game, setGame] = useState(new Chess());
  const [turn, setTurn] = useState("w"); // 'w' for white, 'b' for black
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [possibleMoves, setPossibleMoves] = useState([]);
  const [captureMoves, setCaptureMoves] = useState([]);

  const moveSoundRef = useRef(new Audio(moveSound));
  const captureSoundRef = useRef(new Audio(captureSound));

  const getCaptureMoves = (gameInstance, color) => {
    const moves = gameInstance.moves({ verbose: true });
    return moves.filter(
      (move) => move.color === color && move.flags.includes("c")
    );
  };

  const updateCaptureMoves = () => {
    const mandatoryCaptures = getCaptureMoves(game, turn);
    setCaptureMoves(mandatoryCaptures);
  };

  useEffect(() => {
    updateCaptureMoves();
    // eslint-disable-next-line
  }, [turn]);

  const playSound = (sound) => {
    switch (sound) {
      case "move":
        moveSoundRef.current.play();
        break;
      case "capture":
        captureSoundRef.current.play();
        break;
      case "error":
        // Handle error sound
        break;
      default:
        break;
    }
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
      playSound("error");
      toast.error("No piece on the selected square.");
      return false;
    }
    if (piece.color !== turn) {
      playSound("error");
      toast.error("Not your turn. You cannot move this piece.");
      return false;
    }

    const newGame = new Chess(game.fen());
    const move = newGame.move({ from: sourceSquare, to: targetSquare });

    if (!move) {
      playSound("error");
      toast.error("Invalid move. Please try again.");
      return false;
    }

    if (!isValidMove(piece, sourceSquare, targetSquare)) {
      playSound("error");
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
    setSelectedSquare(null);
    setPossibleMoves([]);
    setCaptureMoves(mandatoryCaptures);
    playSound("move");
    toast.success(`Next turn: ${turn === "w" ? "Black" : "White"} moved.`);
    return true;
  };

  const handlePieceClick = (square) => {
    const piece = game.get(square);
    if (piece && piece.color === turn) {
      const moves = game
        .moves({ square, verbose: true })
        .map((move) => move.to);
      const mandatoryCaptures = getCaptureMoves(game, turn);
      if (mandatoryCaptures.length > 0) {
        const capturingPieceSquares = mandatoryCaptures.map(
          (move) => move.from
        );
        if (capturingPieceSquares.includes(square)) {
          const captureMovesForPiece = mandatoryCaptures
            .filter((move) => move.from === square)
            .map((move) => move.to);
          setSelectedSquare(square);
          setPossibleMoves(captureMovesForPiece);
        } else {
          toast.error(
            "Mandatory capture move available. Select a capturing piece."
          );
        }
      } else {
        setSelectedSquare(square);
        setPossibleMoves(moves);
      }
    } else {
      if (selectedSquare) {
        if (possibleMoves.includes(square)) {
          onMove(selectedSquare, square);
        } else {
          toast.error("Invalid move. Select a valid target square.");
        }
      }
    }
  };

  const handleQuit = () => {
    toast.info(`Player ${turn === "w" ? "Black" : "White"} wins!`);
    setGame(new Chess());
    setCaptureMoves([]);
  };

  const getCustomSquareStyles = () => {
    const styles = {};
    possibleMoves.forEach((move) => {
      styles[move] = {
        backgroundColor: "rgba(0, 255, 0, 0.4)",
      };
    });
    captureMoves.forEach((move) => {
      styles[move.to] = {
        backgroundColor: "rgba(255, 0, 0, 0.4)",
      };
    });
    return styles;
  };

  return (
    <div className="flex flex-col items-center w-full h-full">
      <div className="flex flex-col sm:flex-row sm:justify-center w-full p-4 mb-4">
        <button
          disabled={turn !== "w"}
          className={`w-full sm:w-auto px-4 py-2 mb-4 sm:mb-0 mr-0 sm:mr-4 rounded ${
            turn === "w" ? "bg-green-500" : "bg-gray-800"
          } hover:bg-green-600 focus:outline-none`}
        >
          Player 1 (White)
        </button>
        <button
          disabled={turn !== "b"}
          className={`w-full sm:w-auto px-4 py-2 rounded ${
            turn === "b" ? "bg-green-500" : "bg-gray-800"
          } hover:bg-green-600 focus:outline-none`}
        >
          Player 2 (Black)
        </button>
      </div>
      <div className="w-[90%] lg:w-full max-w-md">
        <Chessboard
          position={game.fen()}
          onSquareClick={handlePieceClick}
          customSquareStyles={getCustomSquareStyles()}
          boardStyle={{
            borderRadius: "5px",
            boxShadow: "0px 5px 15px rgba(0,0,0,0.3)"
          }}
        />
      </div>
      <div className="mt-4 w-full max-w-xs">
        <button
          onClick={handleQuit}
          className="w-[90%] mb-4 lg:w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 focus:outline-none"
        >
          Quit
        </button>
      </div>
      <ToastContainer />
    </div>
  );
};

export default ChessGame;


