import React from 'react';
import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';

// 簡化的測試組件
const TestApp: React.FC = () => {
  console.log('✅ [TestApp] React 組件已載入');
  console.log('✅ [TestApp] 環境:', process.env.NODE_ENV);

  return (
    <div className="container mt-5">
      <div className="alert alert-success">
        <h2>測試成功！</h2>
        <p>React 應用程式已正常載入</p>
        <p>環境: {process.env.NODE_ENV}</p>
        <p>時間: {new Date().toLocaleString()}</p>
      </div>
    </div>
  );
};

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

console.log('✅ [Index] 開始渲染 React 應用');

root.render(
  <React.StrictMode>
    <TestApp />
  </React.StrictMode>
);

console.log('✅ [Index] React 應用渲染完成');