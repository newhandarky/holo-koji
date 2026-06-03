import config from '../../config/environment';
import { gameWebSocket } from '../../services/websocket';
import { getAccountDiagnosticsSnapshot } from '../../utils/lineAccount';
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

const formatBooleanUnknown = (value: boolean | 'unknown', trueText: string, falseText: string) => {
    if (value === 'unknown') return '未知';
    return value ? trueText : falseText;
};

const countRegisteredWebSocketHandlers = () => (
    Array.from(gameWebSocket.messageHandlers.values()).reduce((count, handlers) => (
        count + (handlers instanceof Set ? handlers.size : 1)
    ), 0)
);

export const buildDiagnosticsSnapshot = (): DiagnosticsSnapshot => {
    const liff = getLiffDiagnosticsSnapshot();
    const account = getAccountDiagnosticsSnapshot();
    const achievementReady = account.accountPersistenceMode === 'durable' && account.accountPersistenceAvailable;

    return {
        connectionState: normalizeConnectionState(gameWebSocket.getConnectionState()),
        websocketUrl: config.websocketUrl,
        apiUrl: config.apiUrl,
        routerMode: resolveRouterMode(),
        environmentName: process.env.NODE_ENV ?? 'unknown',
        diagnosticsEnabled: config.diagnosticsEnabled,
        handlerCount: countRegisteredWebSocketHandlers(),
        liffSupportedOrigin: liff.supportedOrigin,
        liffReady: liff.ready,
        lineLoggedIn: liff.loggedIn,
        lineInClient: liff.inLineClient,
        shareTargetPickerAvailable: liff.shareTargetPickerAvailable,
        inviteFallbackAvailable: liff.fallbackAvailable,
        accountSyncStatus: account.accountSyncStatus,
        accountPersistenceMode: account.accountPersistenceMode,
        accountPersistenceAvailable: account.accountPersistenceAvailable,
        accountPersistenceMessage: account.accountPersistenceMessage,
        liffIdConfigured: Boolean(config.liffId),
        lineChannelIdConfigured: Boolean(config.lineChannelId),
        webAppUrlConfigured: Boolean(config.webAppUrl),
        achievementReadinessStatus: achievementReady ? 'ready' : 'unavailable',
        achievementReadinessMessage: achievementReady
            ? 'Durable account persistence is available for achievements.'
            : 'Achievement progress is not production-ready until durable persistence is available.'
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
    },
    {
        label: 'LINE App 內開啟',
        value: formatBooleanUnknown(snapshot.lineInClient, '是', '否'),
        statusTone: snapshot.lineInClient === true ? 'success' : 'neutral'
    },
    {
        label: '好友選擇器可用',
        value: formatBooleanUnknown(snapshot.shareTargetPickerAvailable, '可用', '不可用'),
        statusTone: snapshot.shareTargetPickerAvailable === true ? 'success' : snapshot.shareTargetPickerAvailable === false ? 'warning' : 'neutral',
        helpText: '僅顯示能力摘要，不包含好友或 LINE profile 資料。'
    },
    {
        label: '邀請 fallback',
        value: snapshot.inviteFallbackAvailable ? '可複製連結' : '不可用',
        statusTone: snapshot.inviteFallbackAvailable ? 'success' : 'warning'
    },
    {
        label: '帳號同步狀態',
        value: snapshot.accountSyncStatus,
        statusTone: snapshot.accountSyncStatus === 'bound'
            ? 'success'
            : snapshot.accountSyncStatus === 'guest'
                ? 'neutral'
                : 'warning'
    },
    {
        label: '帳號持久化狀態',
        value: snapshot.accountPersistenceMode === 'durable' ? 'durable' : 'temporary',
        statusTone: snapshot.accountPersistenceMode === 'durable' ? 'success' : 'warning',
        helpText: snapshot.accountPersistenceMode === 'temporary'
            ? 'Temporary mode is non-durable and not suitable for persistent achievements.'
            : snapshot.accountPersistenceMessage
    },
    {
        label: 'Production readiness',
        value: '安全摘要',
        statusTone: 'neutral',
        helpText: '僅顯示本機可得的安全狀態與設定存在性，不執行遠端探測或保存歷史。'
    },
    {
        label: 'LIFF ID 設定',
        value: snapshot.liffIdConfigured ? '已設定' : '未設定',
        statusTone: snapshot.liffIdConfigured ? 'success' : 'warning'
    },
    {
        label: 'LINE Channel ID 設定',
        value: snapshot.lineChannelIdConfigured ? '已設定' : '未設定',
        statusTone: snapshot.lineChannelIdConfigured ? 'success' : 'warning'
    },
    {
        label: 'Web App URL 設定',
        value: snapshot.webAppUrlConfigured ? '已設定' : '未設定',
        statusTone: snapshot.webAppUrlConfigured ? 'success' : 'warning'
    },
    {
        label: '成就保存準備',
        value: snapshot.achievementReadinessStatus === 'ready' ? 'ready' : 'unavailable',
        statusTone: snapshot.achievementReadinessStatus === 'ready' ? 'success' : 'warning',
        helpText: snapshot.achievementReadinessMessage
    }
];
