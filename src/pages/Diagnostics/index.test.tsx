import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DiagnosticsPage from './index';
import config from '../../config/environment';
import { gameWebSocket } from '../../services/websocket';
import { getLiffDiagnosticsSnapshot } from '../../utils/lineLiff';

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
        loggedIn: 'unknown'
    }))
}));

const mockConfig = config as jest.Mocked<typeof config>;
const mockGameWebSocket = gameWebSocket as jest.Mocked<typeof gameWebSocket>;
const mockGetLiffDiagnosticsSnapshot = getLiffDiagnosticsSnapshot as jest.MockedFunction<typeof getLiffDiagnosticsSnapshot>;

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
            loggedIn: 'unknown'
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
    });

    test('does not render hidden game data or payload dumps', () => {
        render(<DiagnosticsPage />);

        expect(screen.queryByText(/手牌/)).not.toBeInTheDocument();
        expect(screen.queryByText(/pending choice/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/competition groups/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/raw payload/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/game state/i)).not.toBeInTheDocument();
    });

    test('navigates back to lobby', async () => {
        render(<DiagnosticsPage />);

        await userEvent.click(screen.getByRole('button', { name: '返回首頁' }));
        expect(mockNavigate).toHaveBeenCalledWith('/');
    });
});
