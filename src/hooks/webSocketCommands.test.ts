import { GameAction } from '@newhandarky/hanakoji-game-types';
import { gameWebSocket } from '../services/websocket';
import { frontendLogger } from '../utils/runtimeLogger';
import {
    confirmOrderCommand,
    confirmReadyCommand,
    requestRematchCommand,
    sendGameActionCommand
} from './webSocketCommands';

jest.mock('../services/websocket', () => ({
    __esModule: true,
    gameWebSocket: {
        send: jest.fn()
    }
}));

const mockGameWebSocket = gameWebSocket as jest.Mocked<typeof gameWebSocket>;

const createContext = (overrides: Partial<Parameters<typeof sendGameActionCommand>[0]> = {}) => ({
    gameId: 'ABC123',
    playerId: 'host',
    clientDispatch: jest.fn(),
    ...overrides
});

const action = {
    type: 'secret',
    payload: {
        cardIds: ['card-1']
    }
} as unknown as GameAction;

describe('webSocketCommands', () => {
    let warnSpy: jest.SpyInstance;

    beforeEach(() => {
        mockGameWebSocket.send.mockReset();
        warnSpy = jest.spyOn(frontendLogger, 'warn').mockImplementation(() => undefined);
    });

    afterEach(() => {
        warnSpy.mockRestore();
    });

    test('sends GAME_ACTION with unchanged payload shape', () => {
        sendGameActionCommand(createContext(), action);

        expect(mockGameWebSocket.send).toHaveBeenCalledWith('GAME_ACTION', {
            gameId: 'ABC123',
            playerId: 'host',
            action
        });
    });

    test('does not send GAME_ACTION without room context', () => {
        sendGameActionCommand(createContext({ gameId: null }), action);

        expect(mockGameWebSocket.send).not.toHaveBeenCalled();
        expect(warnSpy).toHaveBeenCalledWith(
            '⚠️ [useWebSocket] 缺少 gameId，無法發送遊戲動作',
            { hasGameId: false, hasPlayerId: true }
        );
    });

    test('dispatches fallback error when GAME_ACTION send fails without Error object', () => {
        const clientDispatch = jest.fn();
        mockGameWebSocket.send.mockImplementation(() => {
            throw 'send failed';
        });

        sendGameActionCommand(createContext({ clientDispatch }), action);

        expect(clientDispatch).toHaveBeenCalledWith({
            type: 'SET_ERROR',
            payload: { error: '遊戲動作送出失敗' }
        });
    });

    test('sends rematch, ready and order commands with stable payloads', () => {
        const context = createContext();

        requestRematchCommand(context);
        confirmReadyCommand(context);
        confirmOrderCommand(context);

        expect(mockGameWebSocket.send).toHaveBeenNthCalledWith(1, 'REMATCH_REQUEST', {
            gameId: 'ABC123',
            playerId: 'host'
        });
        expect(mockGameWebSocket.send).toHaveBeenNthCalledWith(2, 'READY_CONFIRM', {
            gameId: 'ABC123',
            playerId: 'host'
        });
        expect(mockGameWebSocket.send).toHaveBeenNthCalledWith(3, 'CONFIRM_ORDER', {
            gameId: 'ABC123',
            playerId: 'host'
        });
    });

    test('logs existing warnings when outbound commands are missing context', () => {
        requestRematchCommand(createContext({ playerId: undefined }));
        confirmReadyCommand(createContext({ playerId: undefined }));
        confirmOrderCommand(createContext({ playerId: undefined }));

        expect(mockGameWebSocket.send).not.toHaveBeenCalled();
        expect(warnSpy).toHaveBeenNthCalledWith(
            1,
            '⚠️ [useWebSocket] 缺少必要資訊，無法發送再來一場',
            { hasGameId: true, hasPlayerId: false }
        );
        expect(warnSpy).toHaveBeenNthCalledWith(
            2,
            '⚠️ [useWebSocket] 缺少必要資訊，無法確認準備',
            { hasGameId: true, hasPlayerId: false }
        );
        expect(warnSpy).toHaveBeenNthCalledWith(
            3,
            '⚠️ [useWebSocket] 缺少必要資訊，無法確認順序',
            { hasGameId: true, hasPlayerId: false }
        );
    });
});
