import React from "react";
import "./App.css";
import ChessGame from "./components/ChessGame";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1 className="text-3xl font-bold">Chess Game</h1>
        <ChessGame />
      </header>
    </div>
  );
}

export default App;
