// 修正您的 src/config/environment.ts
interface EnvironmentConfig {
    websocketUrl: string;
    apiUrl: string;
    isDevelopment: boolean;
    isProduction: boolean;
}

const config: EnvironmentConfig = {
    websocketUrl: process.env.REACT_APP_WEBSOCKET_URL || (
        process.env.NODE_ENV === 'production'
            ? 'wss://holo-koji-server.onrender.com'  // 請替換為實際 Render URL
            : 'ws://localhost:3001'
    ),
    apiUrl: process.env.REACT_APP_API_URL || (
        process.env.NODE_ENV === 'production'
            ? 'https://holo-koji-server.onrender.com'  // 請替換為實際 Render URL
            : 'http://localhost:3001'
    ),
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
};

// 開發環境下顯示配置資訊
if (config.isDevelopment) {
    console.log('🔧 [Environment] 配置資訊:');
    console.log('  WebSocket URL:', config.websocketUrl);
    console.log('  API URL:', config.apiUrl);
    console.log('  環境:', process.env.NODE_ENV);
}

export default config;