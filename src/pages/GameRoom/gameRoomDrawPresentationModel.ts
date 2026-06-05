import type { FocusSection } from '../../components/game/GameBoard';
import {
    classifyDrawEvent,
    getDrawEventId,
    routeDrawPresentation,
    type DrawPresentationRoute,
    type DrawQueueEvent,
    type DrawReviewEvent
} from '../../components/game/drawNotificationModel';

export interface DrawPresentationStateInput {
    activeDrawEventId: string | null;
    activeDrawQueueEvent: DrawQueueEvent | null;
    activeDrawNotificationEventId: string | null;
    completedDrawEventIds: ReadonlySet<string>;
    currentPlayerId: string;
    focusSection: FocusSection;
}

export interface DrawPresentationRouteInput {
    activeDrawQueueEvent: DrawQueueEvent;
    currentPlayerId: string;
    focusSection: FocusSection;
    isInteractionLocked: boolean;
    isPresentationFlowActive: boolean;
}

export interface DrawPresentationRouteDecision {
    drawReviewEvent: DrawReviewEvent;
    route: DrawPresentationRoute;
}

export const getActiveDrawEventId = (event: DrawQueueEvent | null): string | null =>
    event ? getDrawEventId(event) : null;

export const isVisibleSelfDrawEvent = (
    event: DrawQueueEvent | null,
    currentPlayerId: string
): boolean =>
    Boolean(event && event.playerId === currentPlayerId && event.card.type !== 'hidden');

export const isActiveSelfDrawNotificationEvent = ({
    activeDrawEventId,
    activeDrawQueueEvent,
    activeDrawNotificationEventId,
    currentPlayerId
}: DrawPresentationStateInput): boolean =>
    Boolean(
        activeDrawEventId
        && activeDrawNotificationEventId === activeDrawEventId
        && isVisibleSelfDrawEvent(activeDrawQueueEvent, currentPlayerId)
    );

export const shouldHoldFocusForSelfDrawEvent = ({
    activeDrawEventId,
    activeDrawQueueEvent,
    completedDrawEventIds,
    currentPlayerId,
    focusSection
}: DrawPresentationStateInput): boolean =>
    Boolean(
        activeDrawEventId
        && !completedDrawEventIds.has(activeDrawEventId)
        && isVisibleSelfDrawEvent(activeDrawQueueEvent, currentPlayerId)
        && focusSection !== 'handActions'
    );

export const shouldResetDrawPresentationState = (
    activeDrawQueueEvent: DrawQueueEvent | null,
    activeDrawEventId: string | null
): boolean => !activeDrawQueueEvent || !activeDrawEventId;

export const resolveDrawPresentationRoute = ({
    activeDrawQueueEvent,
    currentPlayerId,
    focusSection,
    isInteractionLocked,
    isPresentationFlowActive
}: DrawPresentationRouteInput): DrawPresentationRouteDecision => {
    const drawReviewEvent = classifyDrawEvent(activeDrawQueueEvent, currentPlayerId);
    const route = routeDrawPresentation(
        drawReviewEvent,
        focusSection,
        isPresentationFlowActive || (isInteractionLocked && drawReviewEvent.owner === 'self')
    );

    return { drawReviewEvent, route };
};
