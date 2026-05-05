import config from '../../config/environment';
import { gameWebSocket } from '../../services/websocket';
import { getLiffDiagnosticsSnapshot } from '../../utils/lineLiff';
import { resolveRouterMode } from '../../utils/routerMode';
import { DiagnosticsSnapshot, DiagnosticsSummaryItem } from './types';

const normalizeConnectionState = (state: string): DiagnosticsSnapshot['connectionState'] => {
    switch (state) {
        case 'OPEN':
            return 'connected';
        case 'CONNECTING':
            return 'connecting';
        default:
            return 'disconnected';
    }
};

const formatLineLoginStatus = (value: DiagnosticsSnapshot['lineLoggedIn']) => {
    if (value === 'unknown') return '未知';
    return value ? '已登入' : '未登入';
};

export const buildDiagnosticsSnapshot = (): DiagnosticsSnapshot => {
    const liff = getLiffDiagnosticsSnapshot();

    return {
        connectionState: normalizeConnectionState(gameWebSocket.getConnectionState()),
        websocketUrl: config.websocketUrl,
        apiUrl: config.apiUrl,
        routerMode: resolveRouterMode(),
        environmentName: process.env.NODE_ENV ?? 'unknown',
        diagnosticsEnabled: config.diagnosticsEnabled,
        handlerCount: gameWebSocket.messageHandlers.size,
        liffSupportedOrigin: liff.supportedOrigin,
        liffReady: liff.ready,
        lineLoggedIn: liff.loggedIn
    };
};

export const buildDiagnosticsSummaryItems = (snapshot: DiagnosticsSnapshot): DiagnosticsSummaryItem[] => [
    {
        label: 'WebSocket 連線狀態',
        value: snapshot.connectionState,
        statusTone: snapshot.connectionState === 'connected'
            ? 'success'
            : snapshot.connectionState === 'connecting'
                ? 'warning'
                : 'danger'
    },
    {
        label: 'WebSocket URL',
        value: snapshot.websocketUrl
    },
    {
        label: 'API URL',
        value: snapshot.apiUrl
    },
    {
        label: 'Router 模式',
        value: snapshot.routerMode
    },
    {
        label: '目前環境',
        value: snapshot.environmentName
    },
    {
        label: 'Diagnostics 模式',
        value: snapshot.diagnosticsEnabled ? '已啟用' : '未啟用',
        statusTone: snapshot.diagnosticsEnabled ? 'warning' : 'neutral'
    },
    {
        label: '已註冊 Handler 數量',
        value: String(snapshot.handlerCount)
    },
    {
        label: 'LIFF 支援來源',
        value: snapshot.liffSupportedOrigin ? '支援' : '不支援',
        statusTone: snapshot.liffSupportedOrigin ? 'success' : 'neutral'
    },
    {
        label: 'LIFF 初始化狀態',
        value: snapshot.liffReady ? '已完成' : '未完成',
        statusTone: snapshot.liffReady ? 'success' : 'warning'
    },
    {
        label: 'LINE 登入狀態',
        value: formatLineLoginStatus(snapshot.lineLoggedIn),
        statusTone: snapshot.lineLoggedIn === true ? 'success' : snapshot.lineLoggedIn === false ? 'warning' : 'neutral'
    }
];
