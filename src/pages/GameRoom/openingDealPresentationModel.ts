import type { GameState } from '@newhandarky/hanakoji-game-types';
import type { DealAnimationEvent } from '../../hooks/useWebSocket';

type OpeningDealState = GameState['openingDeal'];

export const getDealQueueEventKey = (event: DealAnimationEvent | null): string | null => {
    if (!event) {
        return null;
    }

    return event.sequence
        .map((step) => `${step.order}:${step.playerId}:${step.card.id}:${step.card.type}`)
        .join('|');
};

export const isOpeningPresentationAllowed = (
    state: Pick<GameState, 'phase' | 'orderDecision'>
): boolean => state.phase === 'playing' && !state.orderDecision.isOpen;

export const getOpeningDealModalSequenceId = ({
    openingDeal,
    currentPlayerId,
    presentationAllowed,
    completedSequenceIds
}: {
    openingDeal: OpeningDealState;
    currentPlayerId: string;
    presentationAllowed: boolean;
    completedSequenceIds: ReadonlySet<string>;
}): string | null => {
    if (
        !currentPlayerId
        || !presentationAllowed
        || !openingDeal
        || openingDeal.status === 'not_replayable'
        || !openingDeal.replayable
        || openingDeal.steps.length === 0
        || completedSequenceIds.has(openingDeal.sequenceId)
    ) {
        return null;
    }

    return openingDeal.sequenceId;
};

export const shouldBuildOpeningDealModalModel = (
    openingDeal: OpeningDealState,
    activeSequenceId: string | null
): openingDeal is NonNullable<OpeningDealState> => Boolean(
    openingDeal
    && activeSequenceId
    && openingDeal.sequenceId === activeSequenceId
    && openingDeal.status !== 'not_replayable'
    && openingDeal.replayable
);
