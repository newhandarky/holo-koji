// src/config/environment.ts - 修正版本，生產環境也顯示日誌
// 環境設定型別
interface EnvironmentConfig {
    websocketUrl: string;
    apiUrl: string;
    liffId: string;
    isDevelopment: boolean;
    isProduction: boolean;
}

// 統一集中管理前端環境參數
const config: EnvironmentConfig = {
    // WebSocket 連線位址
    websocketUrl: process.env.REACT_APP_WEBSOCKET_URL || (
        process.env.NODE_ENV === 'production'
            ? 'wss://holo-koji-server.onrender.com'
            : 'ws://localhost:3001'
    ),
    // API 連線位址（保留給 HTTP API）
    apiUrl: process.env.REACT_APP_API_URL || (
        process.env.NODE_ENV === 'production'
            ? 'https://holo-koji-server.onrender.com'
            : 'http://localhost:3001'
    ),
    // LIFF ID（LINE 邀請好友功能）
    liffId: process.env.REACT_APP_LIFF_ID || '2009040550-o884r3CI',
    // 是否為開發環境
    isDevelopment: process.env.NODE_ENV === 'development',
    // 是否為生產環境
    isProduction: process.env.NODE_ENV === 'production',
};

// 生產環境也顯示配置資訊，方便除錯
console.log('🔧 [Environment] 配置資訊:');
console.log('  WebSocket URL:', config.websocketUrl);
console.log('  API URL:', config.apiUrl);
console.log('  LIFF ID:', config.liffId);
console.log('  環境:', process.env.NODE_ENV);
console.log('  是否為生產環境:', config.isProduction);
console.log('  是否為開發環境:', config.isDevelopment);

export default config;
