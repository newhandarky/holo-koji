import type { GameState, ItemCard } from 'game-shared-types';

export type OpeningHandRevealStatus = 'not_eligible' | 'pending_take' | 'revealing' | 'revealed';

export interface OpeningHandTakeEligibility {
    openingDealCompleted: boolean;
    phaseIsPlaying: boolean;
    ownHandCount: number;
    isStartingHandCount: boolean;
    hasUsedAnyActionToken: boolean;
    hasPendingInteraction: boolean;
    isEligible: boolean;
    sequenceId: string | null;
}

export interface OpeningHandRevealStep {
    cardId: string;
    index: number;
    delayMs: number;
    durationMs: number;
    visible: boolean;
}

export interface OpeningHandRevealModel {
    status: OpeningHandRevealStatus;
    isEligible: boolean;
    isConcealed: boolean;
    isInteractionBlocked: boolean;
    totalCount: number;
    revealedCount: number;
    reducedMotion: boolean;
    sequenceId: string | null;
    steps: OpeningHandRevealStep[];
}

const STARTING_HAND_COUNT = 6;
const NORMAL_STEP_DELAY_MS = 180;
const NORMAL_STEP_DURATION_MS = 240;
const NORMAL_COMPLETE_BUFFER_MS = 180;
const REDUCED_COMPLETE_MS = 0;

export const getOpeningHandRevealTotalMs = (steps: OpeningHandRevealStep[], reducedMotion: boolean): number => {
    if (reducedMotion || steps.length === 0) {
        return REDUCED_COMPLETE_MS;
    }

    return Math.max(...steps.map((step) => step.delayMs + step.durationMs)) + NORMAL_COMPLETE_BUFFER_MS;
};

export const getOpeningHandTakeEligibility = (
    state: Pick<GameState, 'phase' | 'openingDeal' | 'players' | 'pendingInteraction'>,
    currentPlayerId: string
): OpeningHandTakeEligibility => {
    const currentPlayer = state.players.find((player) => player.id === currentPlayerId);
    const openingDealCompleted = Boolean(
        state.openingDeal
        && state.openingDeal.completed
        && state.openingDeal.status !== 'pending'
    );
    const phaseIsPlaying = state.phase === 'playing';
    const ownHandCount = currentPlayer?.hand.length ?? 0;
    const isStartingHandCount = ownHandCount === STARTING_HAND_COUNT;
    const hasUsedAnyActionToken = Boolean(currentPlayer?.actionTokens.some((token) => token.used));
    const hasPendingInteraction = Boolean(state.pendingInteraction);
    const isEligible = Boolean(
        currentPlayer
        && openingDealCompleted
        && phaseIsPlaying
        && isStartingHandCount
        && !hasUsedAnyActionToken
        && !hasPendingInteraction
    );

    return {
        openingDealCompleted,
        phaseIsPlaying,
        ownHandCount,
        isStartingHandCount,
        hasUsedAnyActionToken,
        hasPendingInteraction,
        isEligible,
        sequenceId: state.openingDeal?.sequenceId ?? null
    };
};

export const createOpeningHandRevealSteps = (
    cards: ItemCard[],
    reducedMotion: boolean,
    revealedCount = reducedMotion ? cards.length : 0
): OpeningHandRevealStep[] => cards.map((card, index) => ({
    cardId: card.id,
    index,
    delayMs: reducedMotion ? 0 : index * NORMAL_STEP_DELAY_MS,
    durationMs: reducedMotion ? 0 : NORMAL_STEP_DURATION_MS,
    visible: reducedMotion || index < revealedCount
}));

export const buildOpeningHandRevealModel = ({
    eligibility,
    cards,
    status,
    reducedMotion,
    revealedCount
}: {
    eligibility: OpeningHandTakeEligibility;
    cards: ItemCard[];
    status: OpeningHandRevealStatus;
    reducedMotion: boolean;
    revealedCount?: number;
}): OpeningHandRevealModel => {
    const normalizedStatus = eligibility.isEligible ? status : 'not_eligible';
    const effectiveRevealedCount = normalizedStatus === 'revealed'
        ? cards.length
        : normalizedStatus === 'revealing'
            ? reducedMotion
                ? cards.length
                : Math.min(revealedCount ?? 0, cards.length)
            : 0;
    const steps = createOpeningHandRevealSteps(cards, reducedMotion, effectiveRevealedCount);

    return {
        status: normalizedStatus,
        isEligible: eligibility.isEligible,
        isConcealed: normalizedStatus === 'pending_take' || normalizedStatus === 'revealing',
        isInteractionBlocked: normalizedStatus === 'pending_take' || normalizedStatus === 'revealing',
        totalCount: cards.length,
        revealedCount: effectiveRevealedCount,
        reducedMotion,
        sequenceId: eligibility.sequenceId,
        steps
    };
};
