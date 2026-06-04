import React from 'react';
import { act, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AccountSyncResult, AchievementStatusResult } from '@newhandarky/hanakoji-game-types';
import { gameWebSocket } from '../../services/websocket';
import { getInviteRoomIdFromLocation, getVerifiedLineProfile } from '../../utils/lineLiff';
import { beginBrowserLineLogin, requestAccountStatus, syncLineAccountWithIdToken } from '../../utils/lineAccount';
import { acknowledgeAchievementUnlocks, requestAchievementStatus } from '../../utils/achievementAccount';
import { frontendLogger } from '../../utils/runtimeLogger';
import { CHARACTER_SET_OPTIONS } from './characterSetOptions';
import Lobby from './index';

export const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate
}));

jest.mock('../../services/websocket', () => {
    const messageHandlers = new Map();

    return {
        __esModule: true,
        gameWebSocket: {
            connect: jest.fn().mockResolvedValue(undefined),
            isConnected: jest.fn(() => true),
            on: jest.fn((messageType, handler) => {
                const handlers = messageHandlers.get(messageType) ?? new Set();
                handlers.add(handler);
                messageHandlers.set(messageType, handlers);
                return () => {
                    handlers.delete(handler);
                    if (handlers.size === 0) {
                        messageHandlers.delete(messageType);
                    }
                };
            }),
            off: jest.fn((messageType, handler) => {
                if (!handler) {
                    messageHandlers.delete(messageType);
                    return;
                }
                const handlers = messageHandlers.get(messageType);
                handlers?.delete(handler);
                if (handlers?.size === 0) {
                    messageHandlers.delete(messageType);
                }
            }),
            send: jest.fn(),
            messageHandlers
        }
    };
});

jest.mock('../../utils/lineLiff', () => ({
    getInviteRoomIdFromLocation: jest.fn(() => ({ roomId: '', source: 'none' })),
    getVerifiedLineProfile: jest.fn().mockResolvedValue(null)
}));

jest.mock('../../utils/lineAccount', () => ({
    beginBrowserLineLogin: jest.fn(),
    getBoundAccountProfile: (result: AccountSyncResult) => (result?.status === 'bound' ? result.profile : null),
    requestAccountStatus: jest.fn().mockResolvedValue({
        status: 'guest',
        persistenceStatus: {
            mode: 'temporary',
            available: true,
            message: 'Account profiles are temporary in this environment.'
        }
    }),
    syncLineAccountWithIdToken: jest.fn().mockResolvedValue({
        status: 'guest',
        persistenceStatus: {
            mode: 'temporary',
            available: true,
            message: 'Account profiles are temporary in this environment.'
        }
    })
}));

jest.mock('../../utils/achievementAccount', () => ({
    requestAchievementStatus: jest.fn().mockResolvedValue({
        status: 'guest',
        message: '成就需要綁定帳號後才會保存。',
        persistenceStatus: {
            mode: 'temporary',
            available: true,
            message: 'Account profiles are temporary in this environment.'
        }
    }),
    acknowledgeAchievementUnlocks: jest.fn()
}));

jest.mock('../../utils/runtimeLogger', () => ({
    frontendLogger: {
        diagnostic: jest.fn(),
        error: jest.fn(),
        info: jest.fn(),
        warn: jest.fn()
    }
}));

export const mockGameWebSocket = gameWebSocket as jest.Mocked<typeof gameWebSocket>;
export const mockRegisteredHandlers = mockGameWebSocket.messageHandlers;
export const mockGetInviteRoomIdFromLocation = getInviteRoomIdFromLocation as jest.MockedFunction<typeof getInviteRoomIdFromLocation>;
export const mockGetVerifiedLineProfile = getVerifiedLineProfile as jest.MockedFunction<typeof getVerifiedLineProfile>;
export const mockBeginBrowserLineLogin = beginBrowserLineLogin as jest.MockedFunction<typeof beginBrowserLineLogin>;
export const mockRequestAccountStatus = requestAccountStatus as jest.MockedFunction<typeof requestAccountStatus>;
export const mockSyncLineAccountWithIdToken = syncLineAccountWithIdToken as jest.MockedFunction<typeof syncLineAccountWithIdToken>;
export const mockRequestAchievementStatus = requestAchievementStatus as jest.MockedFunction<typeof requestAchievementStatus>;
export const mockAcknowledgeAchievementUnlocks = acknowledgeAchievementUnlocks as jest.MockedFunction<typeof acknowledgeAchievementUnlocks>;
export const mockFrontendLogger = frontendLogger as jest.Mocked<typeof frontendLogger>;

export const guestAccountResult: AccountSyncResult = {
    status: 'guest',
    persistenceStatus: {
        mode: 'temporary',
        available: true,
        message: 'Account profiles are temporary in this environment.'
    }
};

export const pendingAchievementStatus = () => new Promise<never>(() => undefined);

export const emptyAchievementStatus: AchievementStatusResult = {
    status: 'available',
    persistenceStatus: {
        mode: 'durable',
        available: true,
        message: 'Account profiles are persistent.'
    },
    newUnlockCount: 0,
    items: [],
    generatedAt: '2026-05-05T12:00:00.000Z'
};

export const testUser = {
    click: async (element: Element) => {
        const user = userEvent.setup();
        await act(async () => {
            await user.click(element);
        });
    },
    type: async (element: Element, text: string) => {
        const user = userEvent.setup();
        await act(async () => {
            await user.type(element, text);
        });
    },
    clear: async (element: Element) => {
        const user = userEvent.setup();
        await act(async () => {
            await user.clear(element);
        });
    },
    selectOptions: async (element: Element, values: string | string[]) => {
        const user = userEvent.setup();
        await act(async () => {
            await user.selectOptions(element, values);
        });
    }
};

export const emitRegisteredHandler = async (messageType: string, payload: unknown) => {
    await waitFor(() => expect(mockGameWebSocket.on).toHaveBeenCalledWith(messageType, expect.any(Function)));
    const handlerCall = [...mockGameWebSocket.on.mock.calls]
        .reverse()
        .find(([registeredMessageType]) => registeredMessageType === messageType);
    const handler = handlerCall?.[1] as ((payload: unknown) => void) | undefined;
    expect(handler).toEqual(expect.any(Function));
    act(() => {
        handler?.(payload);
    });
    if (messageType === 'ERROR' && payload && typeof payload === 'object') {
        const errorPayload = payload as { message?: unknown; code?: unknown };
        expect(mockFrontendLogger.error).toHaveBeenLastCalledWith('❌ [Lobby] 伺服器錯誤', {
            message: typeof errorPayload.message === 'string' ? errorPayload.message : '無法加入房間',
            code: typeof errorPayload.code === 'string' ? errorPayload.code : undefined
        });
    }
};

export const emitServerError = async (payload: { message: string; code?: string }) => {
    await emitRegisteredHandler('ERROR', payload);
    expect(mockFrontendLogger.error).toHaveBeenLastCalledWith('❌ [Lobby] 伺服器錯誤', {
        message: payload.message,
        code: payload.code
    });
};

export const resetLobbyTestHarness = () => {
    mockNavigate.mockReset();
    mockRegisteredHandlers.clear();
    mockGameWebSocket.connect.mockClear();
    mockGameWebSocket.isConnected.mockClear();
    mockGameWebSocket.isConnected.mockReturnValue(true);
    mockGameWebSocket.on.mockClear();
    mockGameWebSocket.off.mockClear();
    mockGameWebSocket.send.mockClear();
    mockGetInviteRoomIdFromLocation.mockReset();
    mockGetInviteRoomIdFromLocation.mockReturnValue({ roomId: '', source: 'none' });
    mockGetVerifiedLineProfile.mockReset();
    mockGetVerifiedLineProfile.mockResolvedValue(null);
    mockBeginBrowserLineLogin.mockReset();
    mockRequestAccountStatus.mockReset();
    mockRequestAccountStatus.mockResolvedValue(guestAccountResult);
    mockSyncLineAccountWithIdToken.mockReset();
    mockSyncLineAccountWithIdToken.mockResolvedValue(guestAccountResult);
    mockRequestAchievementStatus.mockReset();
    mockRequestAchievementStatus.mockImplementation(pendingAchievementStatus);
    mockAcknowledgeAchievementUnlocks.mockReset();
    mockAcknowledgeAchievementUnlocks.mockResolvedValue(emptyAchievementStatus);
    mockFrontendLogger.diagnostic.mockClear();
    mockFrontendLogger.error.mockClear();
    mockFrontendLogger.info.mockClear();
    mockFrontendLogger.warn.mockClear();
    window.localStorage.clear();
    jest.spyOn(window, 'alert').mockImplementation(() => undefined);
    Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: { writeText: jest.fn().mockResolvedValue(undefined) }
    });
    CHARACTER_SET_OPTIONS.forEach((option) => {
        option.available = true;
        option.disabledReason = undefined;
    });
};

export const renderLobby = () => render(<Lobby />);
