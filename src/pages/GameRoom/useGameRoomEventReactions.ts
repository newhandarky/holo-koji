import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { GameState } from '@newhandarky/hanakoji-game-types';
import type { FocusSection } from '../../components/game/GameBoard';
import {
    buildMotionSnapshot,
    deriveMotionCues,
    MotionCue
} from '../../components/game/gameMotion';
import { frontendLogger, summarizeGameState } from '../../utils/runtimeLogger';

interface UseGameRoomEventReactionsOptions {
    state: GameState;
    roomId?: string;
    currentPlayerId: string;
    isConnected: boolean;
    isRematchRequested: boolean;
    setIsRematchRequested: Dispatch<SetStateAction<boolean>>;
    setIsEndSheetCollapsed: Dispatch<SetStateAction<boolean>>;
    focusSection: FocusSection;
    setFocusSection: Dispatch<SetStateAction<FocusSection>>;
    canAct: boolean;
    isInteractionLocked: boolean;
    isOpeningDealModalActive: boolean;
    prefersReducedMotion: boolean;
}

export const useGameRoomEventReactions = ({
    state,
    roomId,
    currentPlayerId,
    isConnected,
    isRematchRequested,
    setIsRematchRequested,
    setIsEndSheetCollapsed,
    focusSection,
    setFocusSection,
    canAct,
    isInteractionLocked,
    isOpeningDealModalActive,
    prefersReducedMotion
}: UseGameRoomEventReactionsOptions) => {
    const [activeMotionCues, setActiveMotionCues] = useState<MotionCue[]>([]);
    const previousFocusSectionRef = useRef<FocusSection>('characterBoard');
    const wasInteractionLockedRef = useRef(false);
    const canActBeforeBlockingRef = useRef(false);
    const previousCanActRef = useRef(false);
    const shouldHoldFocusForSelfDrawRef = useRef(false);
    const previousMotionSnapshotRef = useRef<ReturnType<typeof buildMotionSnapshot> | null>(null);
    const gameSurfaceRef = useRef<HTMLDivElement | null>(null);

    const enqueueMotionCues = useCallback((cues: MotionCue[]) => {
        if (cues.length === 0) {
            return;
        }

        setActiveMotionCues((previous) => {
            const next = [...previous, ...cues];
            const seen = new Set<string>();

            return next.filter((cue) => {
                if (seen.has(cue.id)) {
                    return false;
                }

                seen.add(cue.id);
                return true;
            });
        });

        cues.forEach((cue) => {
            window.setTimeout(() => {
                setActiveMotionCues((previous) => previous.filter((currentCue) => currentCue.id !== cue.id));
            }, cue.durationMs + cue.delayMs + 160);
        });
    }, []);

    useEffect(() => {
        frontendLogger.diagnostic('🐞 [GameRoom] 狀態摘要', {
            roomId,
            currentPlayerId,
            ...summarizeGameState(state)
        });
    }, [state, roomId, isConnected, currentPlayerId]);

    useEffect(() => {
        if (state.phase !== 'ended' && isRematchRequested) {
            setIsRematchRequested(false);
        }
    }, [state.phase, isRematchRequested, setIsRematchRequested]);

    useEffect(() => {
        if (state.phase !== 'ended') {
            setIsEndSheetCollapsed(false);
        }
    }, [state.phase, setIsEndSheetCollapsed]);

    useEffect(() => {
        if (!currentPlayerId || state.phase !== 'playing') {
            previousMotionSnapshotRef.current = buildMotionSnapshot(state, currentPlayerId);
            return;
        }

        const currentSnapshot = buildMotionSnapshot(state, currentPlayerId);
        const previousSnapshot = previousMotionSnapshotRef.current;

        if (previousSnapshot) {
            enqueueMotionCues(deriveMotionCues(previousSnapshot, currentSnapshot, prefersReducedMotion));
        }

        previousMotionSnapshotRef.current = currentSnapshot;
    }, [currentPlayerId, enqueueMotionCues, prefersReducedMotion, state]);

    useEffect(() => {
        const surface = gameSurfaceRef.current;
        if (!surface) {
            return;
        }

        if (isOpeningDealModalActive) {
            surface.setAttribute('inert', '');
            return;
        }

        surface.removeAttribute('inert');
    }, [isOpeningDealModalActive]);

    useEffect(() => {
        if (state.phase !== 'playing') {
            setFocusSection('characterBoard');
            previousFocusSectionRef.current = 'characterBoard';
        }
    }, [state.phase, setFocusSection]);

    useEffect(() => {
        const wasLocked = wasInteractionLockedRef.current;
        if (!wasLocked && isInteractionLocked) {
            previousFocusSectionRef.current = focusSection;
            canActBeforeBlockingRef.current = canAct;
        }
        if (wasLocked && !isInteractionLocked) {
            const becameActionable = !canActBeforeBlockingRef.current && canAct;
            setFocusSection(
                becameActionable && !shouldHoldFocusForSelfDrawRef.current
                    ? 'handActions'
                    : previousFocusSectionRef.current
            );
        }
        wasInteractionLockedRef.current = isInteractionLocked;
    }, [canAct, focusSection, isInteractionLocked, setFocusSection]);

    useEffect(() => {
        const wasCanAct = previousCanActRef.current;
        if (!wasCanAct && canAct && !isInteractionLocked && !shouldHoldFocusForSelfDrawRef.current) {
            setFocusSection('handActions');
        }
        previousCanActRef.current = canAct;
    }, [canAct, isInteractionLocked, setFocusSection]);

    const activePendingMotionKind = useMemo<'gift-result' | 'competition-result' | null>(() => {
        const cue = activeMotionCues.find((item) => item.kind === 'gift-result' || item.kind === 'competition-result');
        if (cue?.kind === 'gift-result' || cue?.kind === 'competition-result') {
            return cue.kind;
        }

        return null;
    }, [activeMotionCues]);

    const setShouldHoldFocusForSelfDrawFlag = useCallback((value: boolean) => {
        shouldHoldFocusForSelfDrawRef.current = value;
    }, []);

    return {
        activeMotionCues,
        activePendingMotionKind,
        enqueueMotionCues,
        gameSurfaceRef,
        setShouldHoldFocusForSelfDrawFlag
    };
};
