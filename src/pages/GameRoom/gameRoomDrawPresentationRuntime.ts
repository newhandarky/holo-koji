import {
    getDrawFlipDurationMs,
    getDrawNotificationTimeoutMs
} from '../../components/game/drawNotificationModel';

export const getDrawFlipConsumeDelayMs = (prefersReducedMotion: boolean): number =>
    getDrawFlipDurationMs(prefersReducedMotion) + 120;

export const getOpponentDrawToastTimeoutMs = (prefersReducedMotion: boolean): number =>
    prefersReducedMotion ? 520 : 700;

export const getSelfDrawNotificationTimeoutMs = (): number =>
    getDrawNotificationTimeoutMs();

export const scheduleDrawPresentationTimer = (
    callback: () => void,
    delayMs: number
): number => window.setTimeout(callback, delayMs);

export const clearDrawPresentationTimer = (timerId: number): void => {
    window.clearTimeout(timerId);
};
