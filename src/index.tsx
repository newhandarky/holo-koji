import React from 'react';
import ReactDOM from 'react-dom/client';
// 引入 Bootstrap 樣式
import 'bootstrap/dist/css/bootstrap.min.css';
// 引入專案自定義全局樣式
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

// React 18 的根渲染 - 不需要任何 Router，App.tsx 中已包含
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);