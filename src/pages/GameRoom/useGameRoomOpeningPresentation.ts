import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GameState, Player } from '@newhandarky/hanakoji-game-types';
import type { FocusSection } from '../../components/game/GameBoard';
import {
    createOpeningDealCueSteps,
    getOpeningDealCueDuration,
    OpeningDealCueStep
} from '../../components/game/gameMotion';
import { buildOpeningDealModalModel } from '../../components/game/openingDealModalModel';
import {
    buildOpeningHandRevealModel,
    createOpeningHandRevealSteps,
    getOpeningHandRevealTotalMs,
    getOpeningHandTakeEligibility,
    OpeningHandRevealStatus
} from '../../components/game/openingHandRevealModel';
import type { DealAnimationEvent } from '../../hooks/useWebSocket';

interface UseGameRoomOpeningPresentationOptions {
    state: GameState;
    roomId?: string;
    currentPlayerId: string;
    currentPlayer: Player | null;
    dealQueue: DealAnimationEvent[];
    consumeDealEvent: () => void;
    prefersReducedMotion: boolean;
    setFocusSection: React.Dispatch<React.SetStateAction<FocusSection>>;
}

const getDealQueueEventKey = (event: DealAnimationEvent | null): string | null => {
    if (!event) {
        return null;
    }

    return event.sequence
        .map((step) => `${step.order}:${step.playerId}:${step.card.id}:${step.card.type}`)
        .join('|');
};

export const useGameRoomOpeningPresentation = ({
    state,
    roomId,
    currentPlayerId,
    currentPlayer,
    dealQueue,
    consumeDealEvent,
    prefersReducedMotion,
    setFocusSection
}: UseGameRoomOpeningPresentationOptions) => {
    const [activeOpeningDealSteps, setActiveOpeningDealSteps] = useState<OpeningDealCueStep[]>([]);
    const [activeOpeningDealModalSequenceId, setActiveOpeningDealModalSequenceId] = useState<string | null>(null);
    const [openingHandRevealStatus, setOpeningHandRevealStatus] = useState<OpeningHandRevealStatus>('not_eligible');
    const [openingHandRevealedCount, setOpeningHandRevealedCount] = useState(0);
    const completedOpeningDealModalSequencesRef = useRef<Set<string>>(new Set());
    const completedOpeningHandRevealSequencesRef = useRef<Set<string>>(new Set());
    const openingHandRevealTimersRef = useRef<number[]>([]);
    const nextDealEvent = dealQueue[0] ?? null;
    const nextDealEventKey = getDealQueueEventKey(nextDealEvent);
    const nextDealEventRef = useRef<DealAnimationEvent | null>(null);
    nextDealEventRef.current = nextDealEvent;

    const clearOpeningHandRevealTimers = useCallback(() => {
        openingHandRevealTimersRef.current.forEach((timerId) => window.clearTimeout(timerId));
        openingHandRevealTimersRef.current = [];
    }, []);

    useEffect(() => {
        const currentDealEvent = nextDealEventRef.current;

        if (!currentPlayerId || !currentDealEvent || !nextDealEventKey) {
            return;
        }

        if (state.openingDeal?.replayable) {
            consumeDealEvent();
            return;
        }

        const steps = createOpeningDealCueSteps(currentDealEvent.sequence, currentPlayerId, prefersReducedMotion);
        if (steps.length === 0) {
            consumeDealEvent();
            return;
        }

        setActiveOpeningDealSteps(steps);
        const totalDuration = getOpeningDealCueDuration(steps);
        const clearTimer = window.setTimeout(() => {
            setActiveOpeningDealSteps([]);
            consumeDealEvent();
        }, totalDuration + 120);

        return () => {
            window.clearTimeout(clearTimer);
        };
    }, [
        consumeDealEvent,
        currentPlayerId,
        nextDealEventKey,
        prefersReducedMotion,
        state.openingDeal?.replayable
    ]);

    useEffect(() => {
        const openingDeal = state.openingDeal;

        if (
            !currentPlayerId
            || !openingDeal
            || openingDeal.status === 'not_replayable'
            || !openingDeal.replayable
            || openingDeal.steps.length === 0
        ) {
            setActiveOpeningDealModalSequenceId(null);
            return;
        }

        if (completedOpeningDealModalSequencesRef.current.has(openingDeal.sequenceId)) {
            return;
        }

        setActiveOpeningDealModalSequenceId(openingDeal.sequenceId);
    }, [currentPlayerId, state.openingDeal]);

    const openingDealModalModel = useMemo(() => {
        const openingDeal = state.openingDeal;

        if (
            !openingDeal
            || !activeOpeningDealModalSequenceId
            || openingDeal.sequenceId !== activeOpeningDealModalSequenceId
            || openingDeal.status === 'not_replayable'
            || !openingDeal.replayable
        ) {
            return null;
        }

        return buildOpeningDealModalModel(openingDeal, state.players, currentPlayerId, prefersReducedMotion);
    }, [activeOpeningDealModalSequenceId, currentPlayerId, prefersReducedMotion, state.openingDeal, state.players]);
    const isOpeningDealModalActive = Boolean(openingDealModalModel);
    const isOpeningDealActive = activeOpeningDealSteps.length > 0 || isOpeningDealModalActive;
    const openingHandEligibility = useMemo(
        () => getOpeningHandTakeEligibility(state, currentPlayerId),
        [currentPlayerId, state]
    );
    const openingHandRevealSequenceId = openingHandEligibility.sequenceId
        ?? (roomId && currentPlayerId ? `${roomId}-${state.round}-${currentPlayerId}` : null);
    const openingHandRevealModel = useMemo(() => buildOpeningHandRevealModel({
        eligibility: {
            ...openingHandEligibility,
            isEligible: openingHandEligibility.isEligible && !isOpeningDealActive,
            sequenceId: openingHandRevealSequenceId
        },
        cards: currentPlayer?.hand ?? [],
        status: openingHandRevealStatus,
        reducedMotion: prefersReducedMotion,
        revealedCount: openingHandRevealedCount
    }), [
        currentPlayer?.hand,
        openingHandEligibility,
        openingHandRevealSequenceId,
        openingHandRevealStatus,
        openingHandRevealedCount,
        isOpeningDealActive,
        prefersReducedMotion
    ]);
    const isOpeningHandRevealBlocking = openingHandRevealModel.isInteractionBlocked;

    const handleOpeningDealModalComplete = useCallback(() => {
        if (activeOpeningDealModalSequenceId) {
            completedOpeningDealModalSequencesRef.current.add(activeOpeningDealModalSequenceId);
        }

        setActiveOpeningDealModalSequenceId(null);
    }, [activeOpeningDealModalSequenceId]);

    useEffect(() => {
        if (!openingHandRevealModel.isEligible || !openingHandRevealSequenceId) {
            clearOpeningHandRevealTimers();
            setOpeningHandRevealStatus('not_eligible');
            setOpeningHandRevealedCount(0);
            return;
        }

        if (completedOpeningHandRevealSequencesRef.current.has(openingHandRevealSequenceId)) {
            setOpeningHandRevealStatus('revealed');
            setOpeningHandRevealedCount(currentPlayer?.hand.length ?? 0);
            return;
        }

        setOpeningHandRevealStatus((currentStatus) => {
            if (currentStatus === 'revealing' || currentStatus === 'pending_take') {
                return currentStatus;
            }

            return 'pending_take';
        });
        setOpeningHandRevealedCount(0);
        setFocusSection('handActions');
    }, [
        clearOpeningHandRevealTimers,
        currentPlayer?.hand.length,
        openingHandRevealModel.isEligible,
        openingHandRevealSequenceId,
        setFocusSection
    ]);

    useEffect(() => () => {
        clearOpeningHandRevealTimers();
    }, [clearOpeningHandRevealTimers]);

    const completeOpeningHandReveal = useCallback(() => {
        if (openingHandRevealSequenceId) {
            completedOpeningHandRevealSequencesRef.current.add(openingHandRevealSequenceId);
        }

        clearOpeningHandRevealTimers();
        setOpeningHandRevealedCount(currentPlayer?.hand.length ?? 0);
        setOpeningHandRevealStatus('revealed');
        setFocusSection('handActions');
    }, [clearOpeningHandRevealTimers, currentPlayer?.hand.length, openingHandRevealSequenceId, setFocusSection]);

    const handleTakeOpeningHand = useCallback(() => {
        if (
            openingHandRevealStatus !== 'pending_take'
            || !openingHandRevealModel.isEligible
            || !currentPlayer
        ) {
            return;
        }

        clearOpeningHandRevealTimers();

        if (prefersReducedMotion) {
            completeOpeningHandReveal();
            return;
        }

        const steps = createOpeningHandRevealSteps(currentPlayer.hand, false);
        setOpeningHandRevealStatus('revealing');
        setOpeningHandRevealedCount(0);

        steps.forEach((step, index) => {
            const timerId = window.setTimeout(() => {
                setOpeningHandRevealedCount(index + 1);
            }, step.delayMs + step.durationMs);
            openingHandRevealTimersRef.current.push(timerId);
        });

        const completeTimerId = window.setTimeout(() => {
            completeOpeningHandReveal();
        }, getOpeningHandRevealTotalMs(steps, false));
        openingHandRevealTimersRef.current.push(completeTimerId);
    }, [
        clearOpeningHandRevealTimers,
        completeOpeningHandReveal,
        currentPlayer,
        openingHandRevealModel.isEligible,
        openingHandRevealStatus,
        prefersReducedMotion
    ]);

    return {
        activeOpeningDealSteps,
        openingDealModalModel,
        isOpeningDealModalActive,
        isOpeningDealActive,
        openingHandRevealModel,
        isOpeningHandRevealBlocking,
        handleOpeningDealModalComplete,
        handleTakeOpeningHand
    };
};
