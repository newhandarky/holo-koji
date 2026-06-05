import type { ItemCard } from '@newhandarky/hanakoji-game-types';

export type DealCueOwner = 'self' | 'opponent';

export interface DealAnimationStep {
    order: number;
    playerId: string;
    card: ItemCard;
}

export interface OpeningDealCueStep {
    id: string;
    owner: DealCueOwner;
    card: ItemCard;
    slotIndex: number;
    slotCount: number;
    delayMs: number;
    durationMs: number;
    reducedMotion: boolean;
    isMasked: boolean;
}

const OPENING_DEAL_STEP_DELAY_MS = {
    normal: 95,
    reduced: 70
};

const OPENING_DEAL_STEP_DURATION_MS = {
    normal: 260,
    reduced: 180
};

export const getOpeningDealCueTiming = (prefersReducedMotion: boolean) => ({
    stepDelayMs: prefersReducedMotion ? OPENING_DEAL_STEP_DELAY_MS.reduced : OPENING_DEAL_STEP_DELAY_MS.normal,
    durationMs: prefersReducedMotion ? OPENING_DEAL_STEP_DURATION_MS.reduced : OPENING_DEAL_STEP_DURATION_MS.normal
});

export const createOpeningDealCueSteps = (
    sequence: DealAnimationStep[],
    viewerId: string,
    prefersReducedMotion: boolean
): OpeningDealCueStep[] => {
    const orderedSequence = [...sequence].sort((a, b) => a.order - b.order);
    const ownerCounts: Record<DealCueOwner, number> = {
        self: 0,
        opponent: 0
    };
    const totals: Record<DealCueOwner, number> = orderedSequence.reduce((acc, step) => {
        const owner: DealCueOwner = step.playerId === viewerId ? 'self' : 'opponent';
        acc[owner] += 1;
        return acc;
    }, { self: 0, opponent: 0 });
    const { stepDelayMs, durationMs } = getOpeningDealCueTiming(prefersReducedMotion);

    return orderedSequence.map((step) => {
        const owner: DealCueOwner = step.playerId === viewerId ? 'self' : 'opponent';
        const slotIndex = ownerCounts[owner];
        ownerCounts[owner] += 1;

        return {
            id: `deal:${owner}:${step.order}:${step.card.id}`,
            owner,
            card: step.card,
            slotIndex,
            slotCount: totals[owner],
            delayMs: step.order * stepDelayMs,
            durationMs,
            reducedMotion: prefersReducedMotion,
            isMasked: step.card.type === 'hidden'
        };
    });
};

export const getOpeningDealCueDuration = (steps: OpeningDealCueStep[]): number =>
    steps.reduce((maxDuration, step) => Math.max(maxDuration, step.delayMs + step.durationMs), 0);
