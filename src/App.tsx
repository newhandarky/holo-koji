import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GameProvider } from './contexts/GameContext';
import Lobby from './pages/Lobby';
import GameRoom from './pages/GameRoom';
import './App.css';

function App() {
  return (
    <GameProvider>
      <BrowserRouter>
        <div className="App">
          <Routes>
            <Route path="/" element={<Lobby />} />
            <Route path="/game/:roomId" element={<GameRoom />} />
          </Routes>
        </div>
      </BrowserRouter>
    </GameProvider>
  );
}

export default App;