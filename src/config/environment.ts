// src/config/environment.ts
interface EnvironmentConfig {
    websocketUrl: string;
    apiUrl: string;
    isDevelopment: boolean;
    isProduction: boolean;
}

const config: EnvironmentConfig = {
    websocketUrl: process.env.NODE_ENV === 'production'
        ? 'wss://holo-koji-server.onrender.com'  // 替換為實際 URL
        : 'ws://localhost:3001',

    apiUrl: process.env.NODE_ENV === 'production'
        ? 'https://holo-koji-server.onrender.com'  // 如果有 REST API
        : 'http://localhost:3001',

    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
};

export default config;
