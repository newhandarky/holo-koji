import {
    appendRuntimeEvent,
    consumeRuntimeEvent,
    clearRuntimeQueueOnCleanup
} from './webSocketEventQueue';

describe('webSocketEventQueue', () => {
    test('appends only valid normalized events without mutating previous queue', () => {
        const previous = [{ id: 'first' }];
        const next = appendRuntimeEvent(previous, { id: 'second' });

        expect(next).toEqual([{ id: 'first' }, { id: 'second' }]);
        expect(previous).toEqual([{ id: 'first' }]);
        expect(appendRuntimeEvent(previous, null)).toBe(previous);
    });

    test('consumes one event and preserves empty queue reference', () => {
        expect(consumeRuntimeEvent([{ id: 'first' }, { id: 'second' }])).toEqual([{ id: 'second' }]);

        const empty: Array<{ id: string }> = [];
        expect(consumeRuntimeEvent(empty)).toBe(empty);
    });

    test('cleanup returns an empty queue only when needed', () => {
        const empty: Array<{ id: string }> = [];
        expect(clearRuntimeQueueOnCleanup(empty)).toBe(empty);
        expect(clearRuntimeQueueOnCleanup([{ id: 'queued' }])).toEqual([]);
    });
});
