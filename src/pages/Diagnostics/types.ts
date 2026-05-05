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
}

export interface DiagnosticsSummaryItem {
    label: string;
    value: string;
    statusTone?: 'neutral' | 'success' | 'warning' | 'danger';
    helpText?: string;
}
