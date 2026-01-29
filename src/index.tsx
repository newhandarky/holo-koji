import React from 'react';
import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import App from './App';

// 取得 root DOM 節點並建立 React root
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

// 渲染 App（StrictMode 用於開發期偵錯）
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
