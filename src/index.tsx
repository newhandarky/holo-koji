import React from 'react';
import ReactDOM from 'react-dom/client';
// 引入 Bootstrap 樣式
import 'bootstrap/dist/css/bootstrap.min.css';
// 引入專案自定義全局樣式
import './index.css';
import App from './App';
import { HashRouter } from 'react-router-dom'; // 新增這行

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

// React 18 的根渲染
root.render(
  <React.StrictMode>
    <HashRouter> {/* 包裝 App 組件 */}
      <App />
    </HashRouter>
  </React.StrictMode>
);
