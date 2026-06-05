import { MutableRefObject } from 'react';
import { saveRoomSessionToken, getStoredRoomSessionToken } from '../utils/roomSession';
import {
    PLAYER_ID_TAKEN_ERROR,
    createWebSocketRuntimeHandlers,
    registerWebSocketRuntimeHandlers
} from './webSocketEventHandlerRegistry';
import { CardDrawEvent, DealAnimationEvent } from './webSocketPayloads';

const makeRef = <TValue,>(current: TValue): MutableRefObject<TValue> => ({ current });

const makeQueueSetter = <TValue,>(initialValue: TValue[]) => {
    let queue = initialValue;
    const setQueue = jest.fn((updater: React.SetStateAction<TValue[]>) => {
        queue = typeof updater === 'function'
            ? (updater as (previous: TValue[]) => TValue[])(queue)
            : updater;
    });

    return {
        setQueue,
        getQueue: () => queue
    };
};

describe('webSocketEventHandlerRegistry', () => {
    beforeEach(() => {
        window.localStorage.clear();
    });

    test('registers the existing server event aliases through one registry', () => {
        const register = jest.fn();
        const handler = jest.fn();
        const handlers = {
            syncGameState: handler,
            handleOrderDecisionStart: handler,
            handleOrderDecisionResult: handler,
            handleOrderConfirmationUpdate: handler,
            handleErrorMessage: handler,
            handleCardDrawn: handler,
            handleDealAnimation: handler,
            handleRoundComplete: handler,
            handleReadyCheck: handler,
            handleReadyStatus: handler,
            ignoreLifecycleEvent: handler
        };

        registerWebSocketRuntimeHandlers(register, handlers);

        expect(register.mock.calls.map(([eventType]) => eventType)).toEqual([
            'GAME_STATE_UPDATE',
            'GAME_STATE_UPDATED',
            'GAME_STATE_SYNC',
            'STATE_CHANGED',
            'GAME_STARTED',
            'READY_CHECK',
            'READY_STATUS',
            'ROUND_COMPLETE',
            'ORDER_DECISION_START',
            'ORDER_DECISION_STARTED',
            'ORDER_DECISION_RESULT',
            'ORDER_DECISION_COMPLETED',
            'ORDER_CONFIRMATION_UPDATE',
            'ORDER_CONFIRMATIONS_UPDATED',
            'ERROR',
            'GAME_ENDED',
            'CARD_DRAWN',
            'DEAL_ANIMATION',
            'ACTION_EXECUTED'
        ]);
    });

    test('queues draw and deal events through existing queue semantics', () => {
        const drawQueue = makeQueueSetter<CardDrawEvent>([]);
        const dealQueue = makeQueueSetter<DealAnimationEvent>([]);
        const handlers = createWebSocketRuntimeHandlers({
            gameId: 'ROOM01',
            playerId: 'p1',
            gameDispatchRef: makeRef(jest.fn()),
            safeDispatch: jest.fn(),
            syncGameState: jest.fn(),
            setDrawQueue: drawQueue.setQueue,
            setDealQueue: dealQueue.setQueue,
            setRoundSummary: jest.fn(),
            roundSummaryTimerRef: makeRef(null),
            setReadyStatus: jest.fn()
        });
        const card = { id: 'card-1', geishaId: 1, type: 'real' as const };

        handlers.handleCardDrawn({ playerId: 'p1', card });
        handlers.handleDealAnimation({ sequence: [{ order: 1, playerId: 'p1', card }] });

        expect(drawQueue.getQueue()).toEqual([{ playerId: 'p1', card }]);
        expect(dealQueue.getQueue()).toEqual([{ sequence: [{ order: 1, playerId: 'p1', card }] }]);
    });

    test('PLAYER_ID_TAKEN clears stale token and dispatches stable recovery message', () => {
        saveRoomSessionToken('ROOM01', 'p1', 'stale-token');
        const safeDispatch = jest.fn();
        const handlers = createWebSocketRuntimeHandlers({
            gameId: 'ROOM01',
            playerId: 'p1',
            gameDispatchRef: makeRef(jest.fn()),
            safeDispatch,
            syncGameState: jest.fn(),
            setDrawQueue: makeQueueSetter<CardDrawEvent>([]).setQueue,
            setDealQueue: makeQueueSetter<DealAnimationEvent>([]).setQueue,
            setRoundSummary: jest.fn(),
            roundSummaryTimerRef: makeRef(null),
            setReadyStatus: jest.fn()
        });

        handlers.handleErrorMessage({
            code: 'PLAYER_ID_TAKEN',
            message: '此玩家名稱已在房間中使用，請重新加入或更換名稱。'
        });

        expect(getStoredRoomSessionToken('ROOM01', 'p1')).toBeNull();
        expect(safeDispatch).toHaveBeenCalledWith({
            type: 'SET_ERROR',
            payload: { error: PLAYER_ID_TAKEN_ERROR }
        });
    });
});
