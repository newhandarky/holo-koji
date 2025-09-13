// src/App.tsx
import React from 'react';
import { GameProvider } from './contexts/GameContext';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Lobby from './pages/Lobby';
import GameRoom from './pages/GameRoom';

/**
 * App 組件：整合路由與全局狀態
 */
const App: React.FC = () => {
  return (
    // 使用 GameProvider 提供全局遊戲狀態
    <GameProvider>
      <Router>
        <Routes>
          {/* 大廳頁面路由 */}
          <Route path="/" element={<Lobby />} />
          {/* 遊戲房間路由，:roomId 為動態參數 */}
          <Route path="/game/:roomId" element={<GameRoom />} />
        </Routes>
      </Router>
    </GameProvider>
  );
};

export default App;