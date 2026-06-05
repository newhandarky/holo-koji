import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ItemCard } from '@newhandarky/hanakoji-game-types';
import type { FocusSection } from '../../components/game/GameBoard';
import { createDrawMotionCue, MotionCue } from '../../components/game/gameMotion';
import {
    classifyDrawEvent,
    getDrawEventId,
    getDrawFlipDurationMs,
    getDrawNotificationTimeoutMs,
    routeDrawPresentation
} from '../../components/game/drawNotificationModel';
import type { CardDrawEvent } from '../../hooks/useWebSocket';

interface UseGameRoomDrawPresentationOptions {
    drawQueue: CardDrawEvent[];
    consumeDrawEvent: () => void;
    currentPlayerId: string;
    focusSection: FocusSection;
    setFocusSection: React.Dispatch<React.SetStateAction<FocusSection>>;
    isInteractionLocked: boolean;
    isPresentationFlowActive: boolean;
    getPlayerDisplayName: (playerId?: string) => string;
    enqueueMotionCues: (cues: MotionCue[]) => void;
    prefersReducedMotion: boolean;
}

export const useGameRoomDrawPresentation = ({
    drawQueue,
    consumeDrawEvent,
    currentPlayerId,
    focusSection,
    setFocusSection,
    isInteractionLocked,
    isPresentationFlowActive,
    getPlayerDisplayName,
    enqueueMotionCues,
    prefersReducedMotion
}: UseGameRoomDrawPresentationOptions) => {
    const [recentDraw, setRecentDraw] = useState<string | null>(null);
    const [drawHighlightCardId, setDrawHighlightCardId] = useState<string | null>(null);
    const [isDrawHighlightActive, setIsDrawHighlightActive] = useState(false);
    const [activeDrawNotificationEventId, setActiveDrawNotificationEventId] = useState<string | null>(null);
    const [activeDrawAnimationEventId, setActiveDrawAnimationEventId] = useState<string | null>(null);
    const completedDrawEventIdsRef = useRef<Set<string>>(new Set());
    const activeDrawQueueEvent = drawQueue[0] ?? null;
    const activeDrawEventId = activeDrawQueueEvent ? getDrawEventId(activeDrawQueueEvent) : null;
    const isActiveSelfDrawNotification = Boolean(
        activeDrawEventId
        && activeDrawNotificationEventId === activeDrawEventId
        && activeDrawQueueEvent?.playerId === currentPlayerId
        && activeDrawQueueEvent.card.type !== 'hidden'
    );
    const shouldHoldFocusForSelfDraw = Boolean(
        activeDrawEventId
        && !completedDrawEventIdsRef.current.has(activeDrawEventId)
        && activeDrawQueueEvent?.playerId === currentPlayerId
        && activeDrawQueueEvent.card.type !== 'hidden'
        && focusSection !== 'handActions'
    );

    const consumeActiveDrawEvent = useCallback((eventId: string) => {
        completedDrawEventIdsRef.current.add(eventId);
        setRecentDraw(null);
        setActiveDrawNotificationEventId((currentId) => currentId === eventId ? null : currentId);
        setActiveDrawAnimationEventId((currentId) => currentId === eventId ? null : currentId);
        setIsDrawHighlightActive(false);
        setDrawHighlightCardId(null);
        consumeDrawEvent();
    }, [consumeDrawEvent]);

    const startDrawFlipPresentation = useCallback((eventId: string, card: ItemCard) => {
        if (activeDrawAnimationEventId === eventId || completedDrawEventIdsRef.current.has(eventId)) {
            return;
        }

        setRecentDraw(null);
        setActiveDrawNotificationEventId(null);
        setActiveDrawAnimationEventId(eventId);
        setDrawHighlightCardId(card.id);
        setIsDrawHighlightActive(true);
        enqueueMotionCues([createDrawMotionCue(card.id, prefersReducedMotion)]);

        window.setTimeout(() => {
            consumeActiveDrawEvent(eventId);
        }, getDrawFlipDurationMs(prefersReducedMotion) + 120);
    }, [
        activeDrawAnimationEventId,
        consumeActiveDrawEvent,
        enqueueMotionCues,
        prefersReducedMotion
    ]);

    const handleDrawNotificationDismiss = useCallback(() => {
        if (!activeDrawEventId) {
            return;
        }

        consumeActiveDrawEvent(activeDrawEventId);
    }, [activeDrawEventId, consumeActiveDrawEvent]);

    const handleDrawNotificationViewNow = useCallback(() => {
        if (!activeDrawQueueEvent || !activeDrawEventId || activeDrawQueueEvent.card.type === 'hidden') {
            return;
        }

        setFocusSection('handActions');
        startDrawFlipPresentation(activeDrawEventId, activeDrawQueueEvent.card);
    }, [activeDrawEventId, activeDrawQueueEvent, setFocusSection, startDrawFlipPresentation]);

    const handleDrawNotificationKeyDown = useCallback((
        event: React.KeyboardEvent<HTMLButtonElement>,
        action: 'dismiss' | 'view_now'
    ) => {
        if (event.key !== 'Enter' && event.key !== ' ') {
            return;
        }

        event.preventDefault();
        if (action === 'dismiss') {
            handleDrawNotificationDismiss();
            return;
        }

        handleDrawNotificationViewNow();
    }, [handleDrawNotificationDismiss, handleDrawNotificationViewNow]);

    useEffect(() => {
        if (!activeDrawQueueEvent || !activeDrawEventId) {
            setRecentDraw(null);
            setActiveDrawNotificationEventId(null);
            setActiveDrawAnimationEventId(null);
            setIsDrawHighlightActive(false);
            setDrawHighlightCardId(null);
            completedDrawEventIdsRef.current.clear();
            return;
        }

        if (completedDrawEventIdsRef.current.has(activeDrawEventId)) {
            return;
        }

        const drawReviewEvent = classifyDrawEvent(activeDrawQueueEvent, currentPlayerId);
        const route = routeDrawPresentation(
            drawReviewEvent,
            focusSection,
            isPresentationFlowActive || (isInteractionLocked && drawReviewEvent.owner === 'self')
        );

        if (route === 'defer') {
            setRecentDraw(null);
            setActiveDrawNotificationEventId(null);
            return;
        }

        if (route === 'opponent') {
            const label = `${getPlayerDisplayName(activeDrawQueueEvent.playerId)} 抽到了新卡`;
            setRecentDraw(label);
            setActiveDrawNotificationEventId(null);

            const timer = window.setTimeout(() => {
                consumeActiveDrawEvent(activeDrawEventId);
            }, prefersReducedMotion ? 520 : 700);

            return () => window.clearTimeout(timer);
        }

        if (route === 'notify') {
            setRecentDraw(null);
            setActiveDrawNotificationEventId(activeDrawEventId);

            const timer = window.setTimeout(() => {
                consumeActiveDrawEvent(activeDrawEventId);
            }, getDrawNotificationTimeoutMs());

            return () => window.clearTimeout(timer);
        }

        if (drawReviewEvent.cardReference) {
            startDrawFlipPresentation(activeDrawEventId, drawReviewEvent.cardReference);
        }
    }, [
        activeDrawEventId,
        activeDrawQueueEvent,
        consumeActiveDrawEvent,
        currentPlayerId,
        focusSection,
        getPlayerDisplayName,
        isInteractionLocked,
        isPresentationFlowActive,
        prefersReducedMotion,
        startDrawFlipPresentation
    ]);

    return {
        recentDraw,
        drawHighlightCardId,
        isDrawHighlightActive,
        isActiveSelfDrawNotification,
        shouldHoldFocusForSelfDraw,
        handleDrawNotificationDismiss,
        handleDrawNotificationViewNow,
        handleDrawNotificationKeyDown
    };
};
