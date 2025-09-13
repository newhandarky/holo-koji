// src/config/environment.ts - 修正版本，生產環境也顯示日誌
interface EnvironmentConfig {
    websocketUrl: string;
    apiUrl: string;
    isDevelopment: boolean;
    isProduction: boolean;
}

const config: EnvironmentConfig = {
    websocketUrl: process.env.REACT_APP_WEBSOCKET_URL || (
        process.env.NODE_ENV === 'production'
            ? 'wss://holo-koji-server.onrender.com'
            : 'ws://localhost:3001'
    ),
    apiUrl: process.env.REACT_APP_API_URL || (
        process.env.NODE_ENV === 'production'
            ? 'https://holo-koji-server.onrender.com'
            : 'http://localhost:3001'
    ),
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
};

// 生產環境也顯示配置資訊，方便除錯
console.log('🔧 [Environment] 配置資訊:');
console.log('  WebSocket URL:', config.websocketUrl);
console.log('  API URL:', config.apiUrl);
console.log('  環境:', process.env.NODE_ENV);
console.log('  是否為生產環境:', config.isProduction);
console.log('  是否為開發環境:', config.isDevelopment);

export default config;