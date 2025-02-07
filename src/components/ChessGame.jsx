import React, { useState, useEffect, useRef } from "react";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import ChessBackground from "./ChessBackground";
import moveSound from "./game-end.mp3";
import captureSound from "./capture.mp3";
import { toast } from "react-toastify";
import victorySound from "./victory.mp3";
import { Music, Music2, Volume2, VolumeX } from "lucide-react";
import backgroundMusic from "./background.mp3";

const Firework = () => {
  return (
    <div className="absolute w-4 h-4 animate-firework">
      <div className="absolute w-full h-full bg-yellow-400 rounded-full transform scale-0 animate-spark" />
      <div className="absolute w-full h-full bg-red-500 rounded-full transform scale-0 animate-spark delay-100" />
      <div className="absolute w-full h-full bg-blue-500 rounded-full transform scale-0 animate-spark delay-200" />
      <div className="absolute w-full h-full bg-green-500 rounded-full transform scale-0 animate-spark delay-300" />
    </div>
  );
};

const Confetti = () => {
  return (
    <div className="fixed inset-0 pointer-events-none">
      {[...Array(50)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 rounded-full animate-confetti"
          style={{
            left: `${Math.random() * 100}%`,
            top: `-5%`,
            animationDelay: `${Math.random() * 3}s`,
            backgroundColor: [
              "#ff0000",
              "#00ff00",
              "#0000ff",
              "#ffff00",
              "#ff00ff",
            ][Math.floor(Math.random() * 5)],
          }}
        />
      ))}
    </div>
  );
};

const WinModal = ({ winner, onClose }) => {
  const [showEffect, setShowEffect] = useState(false);

  useEffect(() => {
    setShowEffect(true);
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-10">
      {showEffect && <Confetti />}
      <div className="relative bg-white p-7 rounded-xl shadow-2xl text-center transform scale-0 animate-winner-modal">
        <div className="absolute -top-12 -left-12">
          <Firework />
        </div>
        <div className="absolute -top-12 -right-12">
          <Firework />
        </div>
        <h2 className="text-2xl font-bold text-red-600 animate-bounce">
          Checkmate!
        </h2>
        <div className="text-2xl mb-2 animate-winner-text text-gray-600">
          Player <span className="font-bold text-green-600">{winner}</span>{" "}
          Wins!
        </div>
        <div className="animate-pulse text-lg mb-4 text-gray-600">
          🎉 Congratulations! 🎉
        </div>
        <button
          onClick={onClose}
          className="bg-gradient-to-r from-green-400 to-blue-500 text-white px-3 py-1 rounded-lg text-md font-bold
                   hover:from-green-500 hover:to-blue-600 transform hover:scale-105 transition-all
                   animate-button-pop shadow-lg"
        >
          Play Again
        </button>
      </div>
    </div>
  );
};

const ChessGame = () => {
  const [game, setGame] = useState(new Chess());
  const [turn, setTurn] = useState("w");
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [possibleMoves, setPossibleMoves] = useState([]);
  const [captureMoves, setCaptureMoves] = useState([]);
  const [winner, setWinner] = useState(null);
  const [isSoundMuted, setSoundMuted] = useState(true);
  const [isMusicMuted, setMusicMuted] = useState(true);

  const moveSoundRef = useRef(new Audio(moveSound));
  const captureSoundRef = useRef(new Audio(captureSound));
  const victorySoundRef = useRef(new Audio(victorySound));
  const backgroundMusicRef = useRef(new Audio(backgroundMusic));

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
    const audioElement = backgroundMusicRef.current;
    audioElement.loop = true;
    audioElement.volume = 0.3;

    const handleUserInteraction = () => {
      if (!isMusicMuted) {
        audioElement.play().catch((error) => {
          console.log("Music autoplay prevented:", error);
        });
      }
      document.removeEventListener("click", handleUserInteraction);
      document.removeEventListener("keydown", handleUserInteraction);
    };
    document.addEventListener("click", handleUserInteraction);
    document.addEventListener("keydown", handleUserInteraction);

    return () => {
      audioElement.pause();
      audioElement.currentTime = 0;
      document.removeEventListener("click", handleUserInteraction);
      document.removeEventListener("keydown", handleUserInteraction);
    };
  }, [isMusicMuted]);

  useEffect(() => {
    moveSoundRef.current.muted = isSoundMuted;
    captureSoundRef.current.muted = isSoundMuted;
    victorySoundRef.current.muted = isSoundMuted;
  }, [isSoundMuted]);

  useEffect(() => {
    if (isMusicMuted) {
      backgroundMusicRef.current.pause();
    } else {
      backgroundMusicRef.current.play().catch((error) => {
        console.log("Music autoplay prevented:", error);
      });
    }
  }, [isMusicMuted]);

  useEffect(() => {
    if (winner) {
      backgroundMusicRef.current.pause();
      if (!isSoundMuted) {
        victorySoundRef.current.play();
      }
    } else {
      if (!isMusicMuted) {
        backgroundMusicRef.current.play().catch((error) => {
          console.log("Music autoplay prevented:", error);
        });
      }
    }
  }, [winner, isSoundMuted, isMusicMuted]);

  useEffect(() => {
    updateCaptureMoves();

    console.log("Game object methods:", Object.keys(game));

    if (game.moves().length === 0) {
      const winningPlayer = turn === "w" ? "Black" : "White";
      setWinner(winningPlayer);
      victorySoundRef.current.play();
    }
    // eslint-disable-next-line
  }, [turn, game]);

  const makeMove = (sourceSquare, targetSquare) => {
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
    playSound(move.flags.includes("c") ? "capture" : "move");
    toast.success(`Next turn: ${turn === "w" ? "Black" : "White"} moved.`);
    return true;
  };

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

  const onDrop = (sourceSquare, targetSquare) => {
    return makeMove(sourceSquare, targetSquare);
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
          makeMove(selectedSquare, square);
        } else {
          toast.error("Invalid move. Select a valid target square.");
        }
      }
    }
  };

  const handleQuit = () => {
    const winningPlayer = turn === "w" ? "Black" : "White";
    setWinner(winningPlayer);
    victorySoundRef.current.play();
  };

  const resetGame = () => {
    // Stop victory sound and reset background music
    victorySoundRef.current.pause();
    victorySoundRef.current.currentTime = 0;

    if (!isMusicMuted) {
      backgroundMusicRef.current.currentTime = 0;
      backgroundMusicRef.current.play().catch((error) => {
        console.log("Music autoplay prevented:", error);
      });
    }

    setGame(new Chess());
    setTurn("w");
    setSelectedSquare(null);
    setPossibleMoves([]);
    setCaptureMoves([]);
    setWinner(null);
  };

  const toggleSound = () => {
    setSoundMuted(!isSoundMuted);
  };

  const toggleMusic = () => {
    setMusicMuted(!isMusicMuted);
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
    <>
      <ChessBackground />
      <div className="flex flex-col items-center w-full h-full">
        <div className="flex flex-col sm:flex-row sm:justify-center w-full p-4">
          <button
            disabled={turn !== "w"}
            className={`w-full sm:w-auto px-3 py-1 mb-2 sm:mb-0 mr-0 sm:mr-4 rounded ${
              turn === "w" ? "bg-green-500" : "bg-gray-800"
            } focus:outline-none`}
          >
            Player 1 (White)
          </button>
          <button
            disabled={turn !== "b"}
            className={`w-full sm:w-auto px-3 py-1 rounded ${
              turn === "b" ? "bg-green-500" : "bg-gray-800"
            } focus:outline-none`}
          >
            Player 2 (Black)
          </button>
        </div>
        <div className="w-full max-w-sm">
          <Chessboard
            position={game.fen()}
            onSquareClick={handlePieceClick}
            onPieceDrop={onDrop}
            customSquareStyles={getCustomSquareStyles()}
            boardStyle={{
              borderRadius: "5px",
              boxShadow: "0px 5px 15px rgba(0,0,0,0.3)",
            }}
          />
        </div>
        <div className="mt-4 w-full max-w-xs">
          <button
            onClick={handleQuit}
            className="w-[70%] mb-1 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 focus:outline-none"
          >
            Quit
          </button>
        </div>
        <div className="fixed bottom-4 right-4 flex gap-3 z-50">
          <button
            onClick={toggleSound}
            className="p-3 bg-gray-800 hover:bg-gray-700 rounded-full shadow-lg transform hover:scale-105 transition-all duration-200 focus:outline-none relative group"
          >
            {isSoundMuted ? (
              <VolumeX className="w-6 h-6 text-white" />
            ) : (
              <Volume2 className="w-6 h-6 text-white" />
            )}
            <span className="absolute -top-8 right-0 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
              Sound Effects
            </span>
          </button>

          <button
            onClick={toggleMusic}
            className="p-3 bg-gray-800 hover:bg-gray-700 rounded-full shadow-lg transform hover:scale-105 transition-all duration-200 focus:outline-none relative group"
          >
            {isMusicMuted ? (
              <Music2 className="w-6 h-6 text-white" />
            ) : (
              <Music className="w-6 h-6 text-white" />
            )}
            <span className="absolute -top-8 right-0 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
              Background Music
            </span>
          </button>
        </div>
      </div>

      {winner && <WinModal winner={winner} onClose={resetGame} />}
    </>
  );
};

export default ChessGame;
