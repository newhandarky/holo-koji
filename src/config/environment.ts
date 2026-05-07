// src/config/environment.ts - 修正版本，生產環境也顯示日誌
// 環境設定型別
interface EnvironmentConfig {
    websocketUrl: string;
    apiUrl: string;
    liffId: string;
    lineChannelId: string;
    webAppUrl: string;
    isDevelopment: boolean;
    isProduction: boolean;
    diagnosticsEnabled: boolean;
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
    lineChannelId: process.env.REACT_APP_LINE_CHANNEL_ID || (process.env.REACT_APP_LIFF_ID || '2009040550-o884r3CI').split('-')[0],
    // Web App URL（用於 LINE 分享連結）
    webAppUrl: process.env.REACT_APP_WEB_APP_URL || 'https://newhandarky.github.io/holo-koji',
    // 是否為開發環境
    isDevelopment: process.env.NODE_ENV === 'development',
    // 是否為生產環境
    isProduction: process.env.NODE_ENV === 'production',
    diagnosticsEnabled: process.env.REACT_APP_ENABLE_DIAGNOSTICS === 'true',
};

export default config;
