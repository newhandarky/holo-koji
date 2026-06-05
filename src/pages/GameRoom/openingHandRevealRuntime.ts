import type { OpeningHandRevealStep } from '../../components/game/openingHandRevealModel';
import type { OpeningHandRevealStatus } from '../../components/game/openingHandRevealModel';

export const buildOpeningHandRevealSequenceId = ({
    eligibilitySequenceId,
    roomId,
    round,
    currentPlayerId
}: {
    eligibilitySequenceId: string | null;
    roomId?: string;
    round: number;
    currentPlayerId: string;
}): string | null => eligibilitySequenceId
    ?? (roomId && currentPlayerId ? `${roomId}-${round}-${currentPlayerId}` : null);

export const clearOpeningHandRevealTimers = (timerIds: number[]): void => {
    timerIds.forEach((timerId) => window.clearTimeout(timerId));
};

export const getPendingOpeningHandRevealStatus = (
    currentStatus: OpeningHandRevealStatus
): OpeningHandRevealStatus => {
    if (currentStatus === 'revealing' || currentStatus === 'pending_take') {
        return currentStatus;
    }

    return 'pending_take';
};

export const scheduleOpeningHandRevealTimers = ({
    steps,
    reducedMotion,
    onRevealCount,
    onComplete,
    getTotalMs
}: {
    steps: OpeningHandRevealStep[];
    reducedMotion: boolean;
    onRevealCount: (count: number) => void;
    onComplete: () => void;
    getTotalMs: (steps: OpeningHandRevealStep[], reducedMotion: boolean) => number;
}): number[] => {
    const revealTimerIds = steps.map((step, index) => window.setTimeout(() => {
        onRevealCount(index + 1);
    }, step.delayMs + step.durationMs));
    const completeTimerId = window.setTimeout(() => {
        onComplete();
    }, getTotalMs(steps, reducedMotion));

    return [...revealTimerIds, completeTimerId];
};
