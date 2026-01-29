import React from 'react';
import { BrowserRouter, HashRouter, Routes, Route } from 'react-router-dom';
import { GameProvider } from './contexts/GameContext';
import Lobby from './pages/Lobby';
import GameRoom from './pages/GameRoom';

// 判斷是否使用 HashRouter（GitHub Pages 需要）
const shouldUseHashRouter = () => {
  // 如果是在 GitHub Pages 網域，就用 HashRouter
  return window.location.host.includes('github.io');
};

// App 根元件：負責路由與全域狀態掛載
function App() {
  // 動態選擇路由器
  const Router = shouldUseHashRouter() ? HashRouter : BrowserRouter;

  return (
    <GameProvider>
      <Router>
        <Routes>
          {/* 大廳頁面 */}
          <Route path="/" element={<Lobby />} />
          {/* 遊戲房間頁面 */}
          <Route path="/game/:roomId" element={<GameRoom />} />
        </Routes>
      </Router>
    </GameProvider>
  );
}

export default App;
