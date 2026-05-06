import React from 'react';
import { render, screen } from '@testing-library/react';
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
        diagnosticsEnabled: false
    }
}));

jest.mock('../../services/websocket', () => ({
    __esModule: true,
    gameWebSocket: {
        getConnectionState: jest.fn(() => 'OPEN'),
        messageHandlers: new Map([
            ['ROOM_CREATED', jest.fn()],
            ['ROOM_JOINED', jest.fn()],
            ['GAME_STARTED', jest.fn()],
            ['ERROR', jest.fn()]
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

describe('DiagnosticsPage', () => {
    beforeEach(() => {
        mockNavigate.mockReset();
        mockConfig.websocketUrl = 'ws://localhost:3001';
        mockConfig.apiUrl = 'http://localhost:3001';
        mockConfig.diagnosticsEnabled = false;
        mockGameWebSocket.getConnectionState.mockReturnValue('OPEN');
        mockGameWebSocket.messageHandlers.clear();
        mockGameWebSocket.messageHandlers.set('ROOM_CREATED', jest.fn());
        mockGameWebSocket.messageHandlers.set('ROOM_JOINED', jest.fn());
        mockGameWebSocket.messageHandlers.set('GAME_STARTED', jest.fn());
        mockGameWebSocket.messageHandlers.set('ERROR', jest.fn());
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
    });

    test('navigates back to lobby', async () => {
        render(<DiagnosticsPage />);

        await userEvent.click(screen.getByRole('button', { name: '返回首頁' }));
        expect(mockNavigate).toHaveBeenCalledWith('/');
    });
});
