import {
    clearDrawPresentationTimer,
    getDrawFlipConsumeDelayMs,
    getOpponentDrawToastTimeoutMs,
    getSelfDrawNotificationTimeoutMs,
    scheduleDrawPresentationTimer
} from './gameRoomDrawPresentationRuntime';

describe('gameRoomDrawPresentationRuntime', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    test('keeps existing draw presentation timeout values', () => {
        expect(getDrawFlipConsumeDelayMs(true)).toBe(720);
        expect(getDrawFlipConsumeDelayMs(false)).toBe(1320);
        expect(getOpponentDrawToastTimeoutMs(true)).toBe(520);
        expect(getOpponentDrawToastTimeoutMs(false)).toBe(700);
        expect(getSelfDrawNotificationTimeoutMs()).toBe(5000);
    });

    test('schedules and clears draw presentation timers', () => {
        const callback = jest.fn();
        const timerId = scheduleDrawPresentationTimer(callback, 520);

        clearDrawPresentationTimer(timerId);

        jest.advanceTimersByTime(520);
        expect(callback).not.toHaveBeenCalled();
    });
});
