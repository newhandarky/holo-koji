export interface DiagnosticsSnapshot {
    connectionState: 'disconnected' | 'connecting' | 'connected';
    websocketUrl: string;
    apiUrl: string;
    routerMode: 'BrowserRouter' | 'HashRouter';
    environmentName: string;
    diagnosticsEnabled: boolean;
    handlerCount: number;
    liffSupportedOrigin: boolean;
    liffReady: boolean;
    lineLoggedIn: boolean | 'unknown';
    lineInClient: boolean | 'unknown';
    shareTargetPickerAvailable: boolean | 'unknown';
    inviteFallbackAvailable: boolean;
    accountSyncStatus: 'bound' | 'guest' | 'sync-failed' | 'unverified';
    accountPersistenceMode: 'durable' | 'temporary';
    accountPersistenceAvailable: boolean;
    accountPersistenceMessage: string;
    liffIdConfigured: boolean;
    lineChannelIdConfigured: boolean;
    webAppUrlConfigured: boolean;
    achievementReadinessStatus: 'ready' | 'unavailable';
    achievementReadinessMessage: string;
}

export interface DiagnosticsSummaryItem {
    label: string;
    value: string;
    statusTone?: 'neutral' | 'success' | 'warning' | 'danger';
    helpText?: string;
}
