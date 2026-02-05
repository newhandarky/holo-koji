import React, { useEffect, useState } from 'react';
import { BrowserRouter, HashRouter, Routes, Route } from 'react-router-dom';
import { GameProvider } from './contexts/GameContext';
import Lobby from './pages/Lobby';
import GameRoom from './pages/GameRoom';
import { initLiffIfPossible, shouldShowLiffDiagnostics } from './utils/lineLiff';
import config from './config/environment';

// 判斷是否使用 HashRouter（GitHub Pages 需要）
const shouldUseHashRouter = () => {
  // 如果是在 GitHub Pages 網域，就用 HashRouter
  return window.location.host.includes('github.io');
};

// App 根元件：負責路由與全域狀態掛載
function App() {
  // 動態選擇路由器
  const Router = shouldUseHashRouter() ? HashRouter : BrowserRouter;
  const [liffError, setLiffError] = useState<string | null>(null);

  useEffect(() => {
    if (!shouldShowLiffDiagnostics()) {
      return;
    }

    const toMessage = (error: unknown) => {
      if (error instanceof Error) {
        return error.message;
      }
      if (typeof error === 'string') {
        return error;
      }
      try {
        return JSON.stringify(error);
      } catch {
        return '未知錯誤';
      }
    };

    const handleError = (message: string) => {
      setLiffError(message);
    };

    const onWindowError = (event: ErrorEvent) => {
      if (event.error) {
        handleError(toMessage(event.error));
        return;
      }
      if (event.message) {
        handleError(event.message);
      }
    };

    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      handleError(toMessage(event.reason));
    };

    window.addEventListener('error', onWindowError);
    window.addEventListener('unhandledrejection', onUnhandledRejection);

    const probe = async () => {
      if (!config.liffId) {
        handleError('LIFF ID 未設定，請確認環境變數或 config 設定。');
        return;
      }

      if (!window.liff) {
        handleError('找不到 LIFF SDK，請確認 index.html 是否載入 liff SDK。');
        return;
      }

      const result = await initLiffIfPossible();
      if (!result.ready) {
        handleError('LIFF 初始化失敗，請確認 LIFF ID 與 Endpoint URL。');
      }
    };

    probe();

    return () => {
      window.removeEventListener('error', onWindowError);
      window.removeEventListener('unhandledrejection', onUnhandledRejection);
    };
  }, []);

  return (
    <GameProvider>
      {liffError && (
        <div className="liff-error-banner">
          <div className="liff-error-banner__title">LIFF 載入失敗</div>
          <div className="liff-error-banner__message">{liffError}</div>
          <div className="liff-error-banner__hint">
            請確認 LIFF URL、Endpoint URL 與部署版本是否一致。
          </div>
        </div>
      )}
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
