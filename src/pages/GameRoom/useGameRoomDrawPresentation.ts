import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ItemCard } from '@newhandarky/hanakoji-game-types';
import type { FocusSection } from '../../components/game/GameBoard';
import { createDrawMotionCue, MotionCue } from '../../components/game/gameMotion';
import {
    getActiveDrawEventId,
    isActiveSelfDrawNotificationEvent,
    resolveDrawPresentationRoute,
    shouldHoldFocusForSelfDrawEvent,
    shouldResetDrawPresentationState
} from './gameRoomDrawPresentationModel';
import {
    clearDrawPresentationTimer,
    getDrawFlipConsumeDelayMs,
    getOpponentDrawToastTimeoutMs,
    getSelfDrawNotificationTimeoutMs,
    scheduleDrawPresentationTimer
} from './gameRoomDrawPresentationRuntime';
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
    const activeDrawEventId = getActiveDrawEventId(activeDrawQueueEvent);
    const isActiveSelfDrawNotification = isActiveSelfDrawNotificationEvent({
        activeDrawEventId,
        activeDrawQueueEvent,
        activeDrawNotificationEventId,
        completedDrawEventIds: completedDrawEventIdsRef.current,
        currentPlayerId,
        focusSection
    });
    const shouldHoldFocusForSelfDraw = shouldHoldFocusForSelfDrawEvent({
        activeDrawEventId,
        activeDrawQueueEvent,
        activeDrawNotificationEventId,
        completedDrawEventIds: completedDrawEventIdsRef.current,
        currentPlayerId,
        focusSection
    });

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

        scheduleDrawPresentationTimer(() => {
            consumeActiveDrawEvent(eventId);
        }, getDrawFlipConsumeDelayMs(prefersReducedMotion));
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
        if (shouldResetDrawPresentationState(activeDrawQueueEvent, activeDrawEventId)) {
            setRecentDraw(null);
            setActiveDrawNotificationEventId(null);
            setActiveDrawAnimationEventId(null);
            setIsDrawHighlightActive(false);
            setDrawHighlightCardId(null);
            completedDrawEventIdsRef.current.clear();
            return;
        }

        if (!activeDrawQueueEvent || !activeDrawEventId) {
            return;
        }

        if (completedDrawEventIdsRef.current.has(activeDrawEventId)) {
            return;
        }

        const { drawReviewEvent, route } = resolveDrawPresentationRoute({
            activeDrawQueueEvent,
            currentPlayerId,
            focusSection,
            isInteractionLocked,
            isPresentationFlowActive
        });

        if (route === 'defer') {
            setRecentDraw(null);
            setActiveDrawNotificationEventId(null);
            return;
        }

        if (route === 'opponent') {
            const label = `${getPlayerDisplayName(activeDrawQueueEvent.playerId)} 抽到了新卡`;
            setRecentDraw(label);
            setActiveDrawNotificationEventId(null);

            const timer = scheduleDrawPresentationTimer(() => {
                consumeActiveDrawEvent(activeDrawEventId);
            }, getOpponentDrawToastTimeoutMs(prefersReducedMotion));

            return () => clearDrawPresentationTimer(timer);
        }

        if (route === 'notify') {
            setRecentDraw(null);
            setActiveDrawNotificationEventId(activeDrawEventId);

            const timer = scheduleDrawPresentationTimer(() => {
                consumeActiveDrawEvent(activeDrawEventId);
            }, getSelfDrawNotificationTimeoutMs());

            return () => clearDrawPresentationTimer(timer);
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
