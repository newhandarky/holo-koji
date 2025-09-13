import React from 'react';
import { BrowserRouter, HashRouter, Routes, Route } from 'react-router-dom';
import { isMobile, isBrowser } from 'react-device-detect'; // 可選，也可自行判斷 window.location.host
import { GameProvider } from './contexts/GameContext';
import Lobby from './pages/Lobby';
import GameRoom from './pages/GameRoom';

const useHash = () => {
  // 如果是在 GitHub Pages 網域，就用 HashRouter
  return window.location.host.includes('github.io');
};

function App() {
  const Router = useHash() ? HashRouter : BrowserRouter;

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
