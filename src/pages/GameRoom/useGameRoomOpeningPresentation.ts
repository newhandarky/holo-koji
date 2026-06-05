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
import {
    getDealQueueEventKey,
    getOpeningDealModalSequenceId,
    isOpeningPresentationAllowed,
    shouldBuildOpeningDealModalModel
} from './openingDealPresentationModel';
import {
    buildOpeningHandRevealSequenceId,
    clearOpeningHandRevealTimers,
    getPendingOpeningHandRevealStatus,
    scheduleOpeningHandRevealTimers
} from './openingHandRevealRuntime';

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
    const openingPresentationAllowed = isOpeningPresentationAllowed(state);

    const clearOpeningHandRevealTimerRefs = useCallback(() => {
        clearOpeningHandRevealTimers(openingHandRevealTimersRef.current);
        openingHandRevealTimersRef.current = [];
    }, []);

    useEffect(() => {
        const currentDealEvent = nextDealEventRef.current;

        if (!openingPresentationAllowed || !currentPlayerId || !currentDealEvent || !nextDealEventKey) {
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
        openingPresentationAllowed,
        prefersReducedMotion,
        state.openingDeal?.replayable
    ]);

    useEffect(() => {
        const openingDeal = state.openingDeal;

        const sequenceId = getOpeningDealModalSequenceId({
            openingDeal,
            currentPlayerId,
            presentationAllowed: openingPresentationAllowed,
            completedSequenceIds: completedOpeningDealModalSequencesRef.current
        });

        if (!sequenceId) {
            setActiveOpeningDealModalSequenceId(null);
            return;
        }

        setActiveOpeningDealModalSequenceId(sequenceId);
    }, [currentPlayerId, openingPresentationAllowed, state.openingDeal]);

    const openingDealModalModel = useMemo(() => {
        const openingDeal = state.openingDeal;

        if (!shouldBuildOpeningDealModalModel(openingDeal, activeOpeningDealModalSequenceId)) {
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
    const openingHandRevealSequenceId = buildOpeningHandRevealSequenceId({
        eligibilitySequenceId: openingHandEligibility.sequenceId,
        roomId,
        round: state.round,
        currentPlayerId
    });
    const openingHandRevealModel = useMemo(() => buildOpeningHandRevealModel({
        eligibility: {
            ...openingHandEligibility,
            isEligible: openingHandEligibility.isEligible && openingPresentationAllowed && !isOpeningDealActive,
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
        openingPresentationAllowed,
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
            clearOpeningHandRevealTimerRefs();
            setOpeningHandRevealStatus('not_eligible');
            setOpeningHandRevealedCount(0);
            return;
        }

        if (completedOpeningHandRevealSequencesRef.current.has(openingHandRevealSequenceId)) {
            setOpeningHandRevealStatus('revealed');
            setOpeningHandRevealedCount(currentPlayer?.hand.length ?? 0);
            return;
        }

        setOpeningHandRevealStatus(getPendingOpeningHandRevealStatus);
        setOpeningHandRevealedCount(0);
        setFocusSection('handActions');
    }, [
        clearOpeningHandRevealTimerRefs,
        currentPlayer?.hand.length,
        openingHandRevealModel.isEligible,
        openingHandRevealSequenceId,
        setFocusSection
    ]);

    useEffect(() => () => {
        clearOpeningHandRevealTimerRefs();
    }, [clearOpeningHandRevealTimerRefs]);

    const completeOpeningHandReveal = useCallback(() => {
        if (openingHandRevealSequenceId) {
            completedOpeningHandRevealSequencesRef.current.add(openingHandRevealSequenceId);
        }

        clearOpeningHandRevealTimerRefs();
        setOpeningHandRevealedCount(currentPlayer?.hand.length ?? 0);
        setOpeningHandRevealStatus('revealed');
        setFocusSection('handActions');
    }, [clearOpeningHandRevealTimerRefs, currentPlayer?.hand.length, openingHandRevealSequenceId, setFocusSection]);

    const handleTakeOpeningHand = useCallback(() => {
        if (
            openingHandRevealStatus !== 'pending_take'
            || !openingHandRevealModel.isEligible
            || !currentPlayer
        ) {
            return;
        }

        clearOpeningHandRevealTimerRefs();

        if (prefersReducedMotion) {
            completeOpeningHandReveal();
            return;
        }

        const steps = createOpeningHandRevealSteps(currentPlayer.hand, false);
        setOpeningHandRevealStatus('revealing');
        setOpeningHandRevealedCount(0);

        openingHandRevealTimersRef.current = scheduleOpeningHandRevealTimers({
            steps,
            reducedMotion: false,
            onRevealCount: setOpeningHandRevealedCount,
            onComplete: completeOpeningHandReveal,
            getTotalMs: getOpeningHandRevealTotalMs
        });
    }, [
        clearOpeningHandRevealTimerRefs,
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
