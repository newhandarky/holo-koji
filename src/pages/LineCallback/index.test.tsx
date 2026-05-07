import React from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import LineCallbackPage from './index';
import { gameWebSocket } from '../../services/websocket';
import { resetAccountSyncStateForTests } from '../../utils/lineAccount';

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

const mockGameWebSocket = gameWebSocket as jest.Mocked<typeof gameWebSocket>;

describe('LineCallbackPage', () => {
    beforeEach(() => {
        resetAccountSyncStateForTests();
        mockGameWebSocket.connect.mockClear();
        mockGameWebSocket.isConnected.mockClear();
        mockGameWebSocket.isConnected.mockReturnValue(true);
        mockGameWebSocket.on.mockClear();
        mockGameWebSocket.off.mockClear();
        mockGameWebSocket.send.mockClear();
        mockGameWebSocket.messageHandlers.clear();
        window.localStorage.clear();
        window.sessionStorage.clear();
        window.history.pushState({}, '', '/?lineCallback=1&code=auth-code&state=saved-state');
    });

    test('does not invalidate callback state when React StrictMode re-runs effects', async () => {
        window.localStorage.setItem('hanamikoji-line-login-flow', JSON.stringify({
            state: 'saved-state',
            redirectUri: 'https://example.test/?lineCallback=1',
            createdAt: Date.now()
        }));

        render(
            <React.StrictMode>
                <MemoryRouter>
                    <LineCallbackPage />
                </MemoryRouter>
            </React.StrictMode>
        );

        await waitFor(() => expect(mockGameWebSocket.send).toHaveBeenCalledWith(
            'ACCOUNT_SYNC',
            {
                authorizationCode: 'auth-code',
                redirectUri: 'https://example.test/?lineCallback=1'
            }
        ));

        const accountSyncHandler = mockGameWebSocket.on.mock.calls.find(
            ([messageType]) => messageType === 'ACCOUNT_SYNC_RESULT'
        )?.[1] as ((payload: unknown) => void) | undefined;
        expect(accountSyncHandler).toEqual(expect.any(Function));
        act(() => {
            accountSyncHandler?.({
                status: 'bound',
                profile: {
                    lineUserId: 'U1234567890',
                    displayName: 'LINE 玩家',
                    createdAt: '2026-05-05T12:00:00.000Z',
                    updatedAt: '2026-05-05T12:00:00.000Z',
                    counters: {
                        gamesPlayed: 0,
                        wins: 0,
                        lastPlayedAt: null
                    }
                },
                persistenceStatus: {
                    mode: 'durable',
                    available: true,
                    message: 'Account profiles are persistent.'
                }
            });
        });

        expect(await screen.findByText('LINE 帳號綁定完成，正在返回大廳。')).toBeInTheDocument();
        expect(screen.queryByText('LINE 登入狀態無效，請回到大廳重新綁定。')).not.toBeInTheDocument();
        expect(mockGameWebSocket.send).toHaveBeenCalledTimes(1);
    });

    test('uses provided lobby return callback without forcing a browser reload', async () => {
        const onReturnToLobby = jest.fn();

        render(
            <MemoryRouter>
                <LineCallbackPage onReturnToLobby={onReturnToLobby} />
            </MemoryRouter>
        );

        await userEvent.click(screen.getByRole('button', { name: '回到大廳' }));

        expect(onReturnToLobby).toHaveBeenCalledTimes(1);
    });
});
