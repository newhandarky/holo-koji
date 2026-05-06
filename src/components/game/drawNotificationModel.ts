import type { ItemCard } from 'game-shared-types';
import type { FocusSection } from './GameBoard';

export const DRAW_NOTIFICATION_TIMEOUT_MS = 5000;
export const DRAW_FLIP_NORMAL_MS = 1200;
export const DRAW_FLIP_REDUCED_MS = 600;

export type DrawReviewOwner = 'self' | 'opponent';
export type DrawReviewDecision = 'pending' | 'view_now' | 'dismissed' | 'timeout_dismissed' | 'animated';
export type DrawPresentationRoute = 'notify' | 'animate' | 'defer' | 'opponent';

export interface DrawQueueEvent {
    playerId: string;
    card: ItemCard;
}

export interface DrawReviewEvent {
    eventId: string;
    playerId: string;
    owner: DrawReviewOwner;
    cardReference?: ItemCard;
    source: DrawQueueEvent;
}

export const getDrawEventId = (event: DrawQueueEvent): string =>
    `${event.playerId}:${event.card.type}:${event.card.id}`;

export const classifyDrawEvent = (
    event: DrawQueueEvent,
    currentPlayerId: string
): DrawReviewEvent => {
    const owner: DrawReviewOwner = event.playerId === currentPlayerId ? 'self' : 'opponent';

    return {
        eventId: getDrawEventId(event),
        playerId: event.playerId,
        owner,
        cardReference: owner === 'self' && event.card.type !== 'hidden' ? event.card : undefined,
        source: event
    };
};

export const routeDrawPresentation = (
    event: DrawReviewEvent,
    focusSection: FocusSection,
    isNecessaryFlowActive: boolean
): DrawPresentationRoute => {
    if (isNecessaryFlowActive && event.owner === 'self') {
        return 'defer';
    }

    if (event.owner === 'opponent' || !event.cardReference) {
        return 'opponent';
    }

    return focusSection === 'handActions' ? 'animate' : 'notify';
};

export const getDrawNotificationTimeoutMs = () => DRAW_NOTIFICATION_TIMEOUT_MS;

export const getDrawFlipDurationMs = (prefersReducedMotion: boolean) =>
    prefersReducedMotion ? DRAW_FLIP_REDUCED_MS : DRAW_FLIP_NORMAL_MS;

export const transitionDrawDecision = (
    current: DrawReviewDecision,
    next: DrawReviewDecision
): DrawReviewDecision => {
    if (current === 'animated' || current === 'dismissed' || current === 'timeout_dismissed') {
        return current;
    }

    return next;
};

