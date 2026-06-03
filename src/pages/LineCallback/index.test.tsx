import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import LineCallbackPage from './index';
import { gameWebSocket } from '../../services/websocket';
import {
    consumeLineLoginCallback,
    resetAccountSyncStateForTests,
    syncLineAccountWithAuthorizationCode
} from '../../utils/lineAccount';

jest.mock('../../services/websocket', () => {
    const messageHandlers = new Map();

    return {
        __esModule: true,
        gameWebSocket: {
            connect: jest.fn().mockResolvedValue(undefined),
            isConnected: jest.fn(() => true),
            on: jest.fn((messageType, handler) => {
                messageHandlers.set(messageType, handler);
            }),
            off: jest.fn((messageType) => {
                messageHandlers.delete(messageType);
            }),
            send: jest.fn(),
            messageHandlers
        }
    };
});

jest.mock('../../utils/lineAccount', () => ({
    consumeLineLoginCallback: jest.fn(),
    resetAccountSyncStateForTests: jest.fn(),
    syncLineAccountWithAuthorizationCode: jest.fn()
}));

const mockGameWebSocket = gameWebSocket as jest.Mocked<typeof gameWebSocket>;
const mockConsumeLineLoginCallback = consumeLineLoginCallback as jest.MockedFunction<typeof consumeLineLoginCallback>;
const mockResetAccountSyncStateForTests = resetAccountSyncStateForTests as jest.MockedFunction<typeof resetAccountSyncStateForTests>;
const mockSyncLineAccountWithAuthorizationCode = syncLineAccountWithAuthorizationCode as jest.MockedFunction<typeof syncLineAccountWithAuthorizationCode>;

describe('LineCallbackPage', () => {
    beforeEach(() => {
        mockResetAccountSyncStateForTests();
        mockGameWebSocket.connect.mockClear();
        mockGameWebSocket.isConnected.mockClear();
        mockGameWebSocket.isConnected.mockReturnValue(true);
        mockGameWebSocket.on.mockClear();
        mockGameWebSocket.off.mockClear();
        mockGameWebSocket.send.mockClear();
        mockGameWebSocket.messageHandlers.clear();
        mockConsumeLineLoginCallback.mockReset();
        mockConsumeLineLoginCallback.mockReturnValue(null);
        mockSyncLineAccountWithAuthorizationCode.mockReset();
        mockSyncLineAccountWithAuthorizationCode.mockImplementation(() => new Promise<never>(() => undefined));
        window.localStorage.clear();
        window.sessionStorage.clear();
        window.history.pushState({}, '', '/?lineCallback=1&code=auth-code&state=saved-state');
    });

    test('does not invalidate callback state when React StrictMode re-runs effects', async () => {
        mockConsumeLineLoginCallback.mockReturnValueOnce({
            authorizationCode: 'auth-code',
            redirectUri: 'https://example.test/?lineCallback=1',
        });
        mockSyncLineAccountWithAuthorizationCode.mockReturnValue(new Promise<never>(() => undefined));

        const firstRender = render(
            <MemoryRouter>
                <LineCallbackPage />
            </MemoryRouter>
        );
        await waitFor(() => expect(mockSyncLineAccountWithAuthorizationCode).toHaveBeenCalledTimes(1));
        firstRender.unmount();

        render(
            <MemoryRouter>
                <LineCallbackPage />
            </MemoryRouter>
        );

        expect(screen.getByText('正在綁定 LINE 帳號...')).toBeInTheDocument();
        expect(screen.queryByText('LINE 登入狀態無效，請回到大廳重新綁定。')).not.toBeInTheDocument();
        expect(mockConsumeLineLoginCallback).toHaveBeenCalledTimes(1);
        expect(mockSyncLineAccountWithAuthorizationCode).toHaveBeenCalledWith(
            'auth-code',
            'https://example.test/?lineCallback=1'
        );
        expect(mockSyncLineAccountWithAuthorizationCode).toHaveBeenCalledTimes(1);
    });

    test('uses provided lobby return callback without forcing a browser reload', async () => {
        const onReturnToLobby = jest.fn();
        const user = userEvent.setup();

        render(
            <MemoryRouter>
                <LineCallbackPage onReturnToLobby={onReturnToLobby} />
            </MemoryRouter>
        );

        await user.click(screen.getByRole('button', { name: '回到大廳' }));

        expect(onReturnToLobby).toHaveBeenCalledTimes(1);
    });
});
