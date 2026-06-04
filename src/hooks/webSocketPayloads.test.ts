import {
    cardDrawEvent,
    dealAnimationEvent,
    normalizeErrorPayload,
    orderConfirmationUpdate,
    orderDecisionPlayers,
    orderDecisionResult,
    readyStatusPayload,
    resolveGameStatePayload,
    roundCompletePayload
} from './webSocketPayloads';

const gameState = {
    gameId: 'ROOM01',
    players: []
};

describe('webSocketPayloads', () => {
    test('resolves wrapped and legacy game state payloads', () => {
        expect(resolveGameStatePayload({ gameState })).toBe(gameState);
        expect(resolveGameStatePayload(gameState)).toBe(gameState);
        expect(resolveGameStatePayload({ players: [] })).toBeNull();
        expect(resolveGameStatePayload(null)).toBeNull();
    });

    test('parses order decision payloads defensively', () => {
        expect(orderDecisionPlayers({ players: ['p1', 'p2'] })).toEqual(['p1', 'p2']);
        expect(orderDecisionPlayers({ players: 'p1' })).toEqual([]);

        expect(orderDecisionResult({
            firstPlayer: 'p1',
            secondPlayer: 'p2',
            order: ['p1', 'p2']
        })).toEqual({
            firstPlayer: 'p1',
            secondPlayer: 'p2',
            order: ['p1', 'p2']
        });
        expect(orderDecisionResult({ firstPlayer: 'p1' })).toBeNull();
    });

    test('normalizes order confirmation lists', () => {
        expect(orderConfirmationUpdate({ confirmations: ['p1'], waitingFor: ['p2'] })).toEqual({
            confirmations: ['p1'],
            waitingFor: ['p2']
        });
        expect(orderConfirmationUpdate({ confirmations: 'p1' })).toEqual({
            confirmations: [],
            waitingFor: []
        });
    });

    test('normalizes string object and unknown error payloads', () => {
        expect(normalizeErrorPayload('錯誤')).toEqual({ code: undefined, message: '錯誤' });
        expect(normalizeErrorPayload({ code: 'PLAYER_ID_TAKEN', message: '名稱重複' })).toEqual({
            code: 'PLAYER_ID_TAKEN',
            message: '名稱重複'
        });
        expect(normalizeErrorPayload(null)).toEqual({ code: undefined, message: '未知錯誤' });
    });

    test('parses card drawn event without leaking additional validation assumptions', () => {
        const card = { id: 'card-1', geishaId: 1, type: 'real' as const };
        expect(cardDrawEvent({ playerId: 'p1', card })).toEqual({ playerId: 'p1', card });
        expect(cardDrawEvent({ playerId: 1, card })).toBeNull();
    });

    test('filters invalid deal animation sequence steps', () => {
        const card = { id: 'card-1', geishaId: 1, type: 'real' as const };
        expect(dealAnimationEvent({
            sequence: [
                { order: 1, playerId: 'p1', card },
                { order: 'bad', playerId: 'p2', card },
                null
            ]
        })).toEqual({
            sequence: [{ order: 1, playerId: 'p1', card }]
        });
        expect(dealAnimationEvent({ sequence: [{ order: 'bad' }] })).toBeNull();
    });

    test('parses round complete and ready status payloads', () => {
        expect(roundCompletePayload({ round: 2 })).toEqual({ round: 2 });
        expect(roundCompletePayload({ round: 0 })).toBeNull();

        const ready = { confirmations: ['p1'], waitingFor: ['p2'] };
        expect(readyStatusPayload(ready)).toBe(ready);
        expect(readyStatusPayload(null)).toBeNull();
    });
});
