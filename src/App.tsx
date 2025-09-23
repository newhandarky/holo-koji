import React from 'react';
import { BrowserRouter, HashRouter, Routes, Route } from 'react-router-dom';
import { GameProvider } from './contexts/GameContext';
import Lobby from './pages/Lobby';
import GameRoom from './pages/GameRoom';

const shouldUseHashRouter = () => {
  // 如果是在 GitHub Pages 網域，就用 HashRouter
  return window.location.host.includes('github.io');
};

function App() {
  const Router = shouldUseHashRouter() ? HashRouter : BrowserRouter;

  return (
    <GameProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Lobby />} />
          <Route path="/game/:roomId" element={<GameRoom />} />
        </Routes>
      </Router>
    </GameProvider>
  );
}

export default App;
