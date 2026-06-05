import React from 'react';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DiagnosticsPage from './index';
import config from '../../config/environment';
import { gameWebSocket } from '../../services/websocket';
import { getLiffDiagnosticsSnapshot } from '../../utils/lineLiff';
import { getAccountDiagnosticsSnapshot } from '../../utils/lineAccount';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate
}));

jest.mock('../../config/environment', () => ({
    __esModule: true,
    default: {
        websocketUrl: 'ws://localhost:3001',
        apiUrl: 'http://localhost:3001',
        liffId: 'test-liff-id',
        lineChannelId: 'test-channel-id',
        webAppUrl: 'https://example.test/holo-koji',
        diagnosticsEnabled: false
    }
}));

jest.mock('../../services/websocket', () => ({
    __esModule: true,
    gameWebSocket: {
        getConnectionState: jest.fn(() => 'OPEN'),
        messageHandlers: new Map([
            ['ROOM_CREATED', new Set([jest.fn()])],
            ['ROOM_JOINED', new Set([jest.fn()])],
            ['GAME_STARTED', new Set([jest.fn()])],
            ['ERROR', new Set([jest.fn()])]
        ])
    }
}));

jest.mock('../../utils/lineLiff', () => ({
    __esModule: true,
    getLiffDiagnosticsSnapshot: jest.fn(() => ({
        supportedOrigin: false,
        hasSdk: false,
        ready: false,
        loggedIn: 'unknown',
        inLineClient: 'unknown',
        shareTargetPickerAvailable: 'unknown',
        fallbackAvailable: true
    }))
}));

jest.mock('../../utils/lineAccount', () => ({
    __esModule: true,
    getAccountDiagnosticsSnapshot: jest.fn(() => ({
        accountSyncStatus: 'guest',
        accountPersistenceMode: 'temporary',
        accountPersistenceAvailable: true,
        accountPersistenceMessage: 'Account profiles are temporary in this environment.'
    }))
}));

const mockConfig = config as jest.Mocked<typeof config>;
const mockGameWebSocket = gameWebSocket as jest.Mocked<typeof gameWebSocket>;
const mockGetLiffDiagnosticsSnapshot = getLiffDiagnosticsSnapshot as jest.MockedFunction<typeof getLiffDiagnosticsSnapshot>;
const mockGetAccountDiagnosticsSnapshot = getAccountDiagnosticsSnapshot as jest.MockedFunction<typeof getAccountDiagnosticsSnapshot>;

const setClipboardMock = (writeText: jest.Mock) => {
    Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: { writeText }
    });
};

describe('DiagnosticsPage', () => {
    beforeEach(() => {
        mockNavigate.mockReset();
        mockConfig.websocketUrl = 'ws://localhost:3001';
        mockConfig.apiUrl = 'http://localhost:3001';
        mockConfig.liffId = 'test-liff-id';
        mockConfig.lineChannelId = 'test-channel-id';
        mockConfig.webAppUrl = 'https://example.test/holo-koji';
        mockConfig.diagnosticsEnabled = false;
        mockGameWebSocket.getConnectionState.mockReturnValue('OPEN');
        mockGameWebSocket.messageHandlers.clear();
        mockGameWebSocket.messageHandlers.set('ROOM_CREATED', new Set([jest.fn()]));
        mockGameWebSocket.messageHandlers.set('ROOM_JOINED', new Set([jest.fn()]));
        mockGameWebSocket.messageHandlers.set('GAME_STARTED', new Set([jest.fn()]));
        mockGameWebSocket.messageHandlers.set('ERROR', new Set([jest.fn()]));
        mockGetLiffDiagnosticsSnapshot.mockReturnValue({
            supportedOrigin: false,
            hasSdk: false,
            ready: false,
            loggedIn: 'unknown',
            inLineClient: 'unknown',
            shareTargetPickerAvailable: 'unknown',
            fallbackAvailable: true
        });
        mockGetAccountDiagnosticsSnapshot.mockReturnValue({
            accountSyncStatus: 'guest',
            accountPersistenceMode: 'temporary',
            accountPersistenceAvailable: true,
            accountPersistenceMessage: 'Account profiles are temporary in this environment.'
        });
        Object.defineProperty(navigator, 'clipboard', {
            configurable: true,
            value: undefined
        });
    });

    test('renders allowlisted diagnostics fields', () => {
        render(<DiagnosticsPage />);

        expect(screen.getByRole('heading', { name: '系統診斷' })).toBeInTheDocument();
        expect(screen.getByText('WebSocket URL')).toBeInTheDocument();
        expect(screen.getByText('ws://localhost:3001')).toBeInTheDocument();
        expect(screen.getByText('Router 模式')).toBeInTheDocument();
        expect(screen.getByText('BrowserRouter')).toBeInTheDocument();
        expect(screen.getByText('已註冊 Handler 數量')).toBeInTheDocument();
        expect(screen.getByText('4')).toBeInTheDocument();
        expect(screen.getByText('好友選擇器可用')).toBeInTheDocument();
        expect(screen.getByText('邀請 fallback')).toBeInTheDocument();
        expect(screen.getByText('可複製連結')).toBeInTheDocument();
        expect(screen.getByText('Production readiness')).toBeInTheDocument();
        expect(screen.getByText('LIFF ID 設定')).toBeInTheDocument();
        expect(screen.getByText('LINE Channel ID 設定')).toBeInTheDocument();
        expect(screen.getByText('Web App URL 設定')).toBeInTheDocument();
    });

    test('does not render hidden game data or payload dumps', () => {
        render(<DiagnosticsPage />);

        expect(screen.queryByText(/手牌/)).not.toBeInTheDocument();
        expect(screen.queryByText(/pending choice/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/competition groups/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/raw payload/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/game state/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/lineUserId/)).not.toBeInTheDocument();
        expect(screen.queryByText(/raw profile/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/token/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/recipient/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/redis:\/\/|LINE_CHANNEL_SECRET|authorization code|id token/i)).not.toBeInTheDocument();
    });

    test('renders safe invite capability summary without private LINE fields', () => {
        mockGetLiffDiagnosticsSnapshot.mockReturnValue({
            supportedOrigin: true,
            hasSdk: true,
            ready: true,
            loggedIn: false,
            inLineClient: true,
            shareTargetPickerAvailable: true,
            fallbackAvailable: true
        });

        render(<DiagnosticsPage />);

        expect(screen.getByText('LINE App 內開啟')).toBeInTheDocument();
        expect(screen.getByText('好友選擇器可用')).toBeInTheDocument();
        expect(screen.getByText('可用')).toBeInTheDocument();
        expect(screen.getByText('僅顯示能力摘要，不包含好友或 LINE profile 資料。')).toBeInTheDocument();
        expect(screen.queryByText(/lineUserId|accessToken|raw profile|recipient/i)).not.toBeInTheDocument();
    });

    test('renders account sync and temporary persistence status without private account fields', () => {
        mockGetAccountDiagnosticsSnapshot.mockReturnValue({
            accountSyncStatus: 'sync-failed',
            accountPersistenceMode: 'temporary',
            accountPersistenceAvailable: true,
            accountPersistenceMessage: 'Account profiles are temporary in this environment.'
        });

        render(<DiagnosticsPage />);

        expect(screen.getByText('帳號同步狀態')).toBeInTheDocument();
        expect(screen.getByText('sync-failed')).toBeInTheDocument();
        expect(screen.getByText('帳號持久化狀態')).toBeInTheDocument();
        expect(screen.getByText('temporary')).toBeInTheDocument();
        expect(screen.getByText('Temporary mode is non-durable and not suitable for persistent achievements.')).toBeInTheDocument();
        expect(screen.getByText('成就保存準備')).toBeInTheDocument();
        expect(screen.getByText('unavailable')).toBeInTheDocument();
        expect(screen.getByText('Achievement progress is not production-ready until durable persistence is available.')).toBeInTheDocument();
        expect(screen.queryByText('U1234567890')).not.toBeInTheDocument();
    });

    test('renders durable account persistence status', () => {
        mockGetAccountDiagnosticsSnapshot.mockReturnValue({
            accountSyncStatus: 'bound',
            accountPersistenceMode: 'durable',
            accountPersistenceAvailable: true,
            accountPersistenceMessage: 'Account profiles are persistent.'
        });

        render(<DiagnosticsPage />);

        expect(screen.getByText('bound')).toBeInTheDocument();
        expect(screen.getByText('durable')).toBeInTheDocument();
        expect(screen.getByText('Account profiles are persistent.')).toBeInTheDocument();
        expect(screen.getByText('成就保存準備')).toBeInTheDocument();
        expect(screen.getByText('ready')).toBeInTheDocument();
        expect(screen.getByText('Durable account persistence is available for achievements.')).toBeInTheDocument();
    });

    test('renders configuration presence without exposing configured LINE values', () => {
        mockConfig.liffId = '2009040550-secret-liff';
        mockConfig.lineChannelId = '2009040550';
        mockConfig.webAppUrl = 'https://newhandarky.github.io/holo-koji';

        render(<DiagnosticsPage />);

        expect(screen.getByText('LIFF ID 設定')).toBeInTheDocument();
        expect(screen.getByText('LINE Channel ID 設定')).toBeInTheDocument();
        expect(screen.getByText('Web App URL 設定')).toBeInTheDocument();
        expect(screen.getAllByText('已設定')).toHaveLength(3);
        expect(screen.queryByText('2009040550-secret-liff')).not.toBeInTheDocument();
        expect(screen.queryByText('2009040550')).not.toBeInTheDocument();
        expect(screen.queryByText('https://newhandarky.github.io/holo-koji')).not.toBeInTheDocument();
    });

    test('does not render monitoring, history, or live probe readiness labels', () => {
        render(<DiagnosticsPage />);

        expect(screen.getByText('僅顯示本機可得的安全狀態與設定存在性，不執行遠端探測或保存歷史。')).toBeInTheDocument();
        expect(screen.queryByText(/Render \/health probe/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/Redis probe/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/status page/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/uptime/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/alert/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/history/i)).not.toBeInTheDocument();
    });

    test('renders playtest timing checklist for screenshot review', () => {
        render(<DiagnosticsPage />);

        expect(screen.getByRole('heading', { name: '試玩時序確認' })).toBeInTheDocument();
        expect(screen.getByText('房型')).toBeInTheDocument();
        expect(screen.getByText('順序確認')).toBeInTheDocument();
        expect(screen.getByText('opening deal')).toBeInTheDocument();
        expect(screen.getByText('opening hand reveal')).toBeInTheDocument();
        expect(screen.getByText('draw toast')).toBeInTheDocument();
        expect(screen.getByText('pending interaction')).toBeInTheDocument();
        expect(screen.getByText('round summary')).toBeInTheDocument();
        expect(screen.getByText('reconnect')).toBeInTheDocument();
    });

    test('copies a safe playtest timing checklist without sensitive fields', async () => {
        const user = userEvent.setup();
        const writeText = jest.fn().mockResolvedValue(undefined);
        setClipboardMock(writeText);

        render(<DiagnosticsPage />);

        await act(async () => {
            await user.click(screen.getByRole('button', { name: '複製確認清單' }));
        });

        expect(writeText).toHaveBeenCalledTimes(1);
        const copiedText = writeText.mock.calls[0][0] as string;
        expect(copiedText).toContain('試玩時序確認');
        expect(copiedText).toContain('opening deal');
        expect(copiedText).toContain('draw toast');
        expect(copiedText).not.toMatch(/token|lineUserId|raw profile|hidden card id|raw payload/i);
        expect(await screen.findByText('已複製確認清單')).toBeInTheDocument();
    });

    test('shows manual copy fallback when clipboard write fails', async () => {
        const user = userEvent.setup();
        setClipboardMock(jest.fn().mockRejectedValue(new Error('clipboard unavailable')));

        render(<DiagnosticsPage />);

        await act(async () => {
            await user.click(screen.getByRole('button', { name: '複製確認清單' }));
        });

        expect(await screen.findByText('無法自動複製，請手動選取下方文字。')).toBeInTheDocument();
        const fallbackText = screen.getByRole('textbox', { name: '可手動複製的試玩確認清單' }) as HTMLTextAreaElement;
        expect(fallbackText.value).toContain('試玩時序確認');
    });

    test('navigates back to lobby', async () => {
        const user = userEvent.setup();
        render(<DiagnosticsPage />);

        await user.click(screen.getByRole('button', { name: '返回首頁' }));
        expect(mockNavigate).toHaveBeenCalledWith('/');
    });
});
