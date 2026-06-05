import {
    buildOpeningHandRevealSequenceId,
    clearOpeningHandRevealTimers,
    getPendingOpeningHandRevealStatus,
    scheduleOpeningHandRevealTimers
} from './openingHandRevealRuntime';

describe('openingHandRevealRuntime', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    test('prefers server sequence id and falls back to room round player key', () => {
        expect(buildOpeningHandRevealSequenceId({
            eligibilitySequenceId: 'server-sequence',
            roomId: 'ROOM01',
            round: 2,
            currentPlayerId: 'p1'
        })).toBe('server-sequence');
        expect(buildOpeningHandRevealSequenceId({
            eligibilitySequenceId: null,
            roomId: 'ROOM01',
            round: 2,
            currentPlayerId: 'p1'
        })).toBe('ROOM01-2-p1');
    });

    test('keeps active reveal status and starts pending state otherwise', () => {
        expect(getPendingOpeningHandRevealStatus('revealing')).toBe('revealing');
        expect(getPendingOpeningHandRevealStatus('pending_take')).toBe('pending_take');
        expect(getPendingOpeningHandRevealStatus('not_eligible')).toBe('pending_take');
        expect(getPendingOpeningHandRevealStatus('revealed')).toBe('pending_take');
    });

    test('schedules reveal counts and completion in order', () => {
        const onRevealCount = jest.fn();
        const onComplete = jest.fn();

        scheduleOpeningHandRevealTimers({
            steps: [
                { cardId: 'card-1', index: 0, delayMs: 10, durationMs: 20, visible: false },
                { cardId: 'card-2', index: 1, delayMs: 30, durationMs: 20, visible: false }
            ],
            reducedMotion: false,
            onRevealCount,
            onComplete,
            getTotalMs: () => 70
        });

        jest.advanceTimersByTime(30);
        expect(onRevealCount).toHaveBeenCalledWith(1);
        expect(onComplete).not.toHaveBeenCalled();

        jest.advanceTimersByTime(40);
        expect(onRevealCount).toHaveBeenCalledWith(2);
        expect(onComplete).toHaveBeenCalledTimes(1);
    });

    test('clears scheduled timers without triggering callbacks', () => {
        const onRevealCount = jest.fn();
        const onComplete = jest.fn();
        const timerIds = scheduleOpeningHandRevealTimers({
            steps: [{ cardId: 'card-1', index: 0, delayMs: 10, durationMs: 20, visible: false }],
            reducedMotion: false,
            onRevealCount,
            onComplete,
            getTotalMs: () => 70
        });

        clearOpeningHandRevealTimers(timerIds);
        jest.runOnlyPendingTimers();

        expect(onRevealCount).not.toHaveBeenCalled();
        expect(onComplete).not.toHaveBeenCalled();
    });
});
