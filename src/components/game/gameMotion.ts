import { useEffect, useState } from 'react';
import { GameState, ItemCard, PendingInteraction } from 'game-shared-types';
import { getDrawFlipDurationMs } from './drawNotificationModel';

export type MotionCueKind = 'draw' | 'removal' | 'placement' | 'gift-result' | 'competition-result';
export type MotionOwner = 'self' | 'opponent';
export type MotionSourceZone = 'hand' | 'gift-modal' | 'competition-modal' | 'opponent-side';
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

export interface MotionSnapshot {
    currentPlayerId: string;
    myHandCardIds: string[];
    myHandCount: number;
    opponentHandCount: number;
    myPlayedByGeisha: Record<number, string[]>;
    opponentPlayedByGeisha: Record<number, string[]>;
    pendingInteraction: PendingInteraction | null;
}

export interface MotionCue {
    id: string;
    kind: MotionCueKind;
    owner: MotionOwner;
    cardId?: string;
    geishaId?: number;
    sourceZone: MotionSourceZone;
    targetZone: 'hand' | 'board';
    targetGeishaId?: number;
    createdAt: number;
    durationMs: number;
    delayMs: number;
    reducedMotion: boolean;
}

const CUE_PRIORITY: Record<MotionCueKind, number> = {
    draw: 0,
    removal: 1,
    placement: 2,
    'gift-result': 3,
    'competition-result': 4
};

const OPENING_DEAL_STEP_DELAY_MS = {
    normal: 95,
    reduced: 70
};

const OPENING_DEAL_STEP_DURATION_MS = {
    normal: 260,
    reduced: 180
};

const getOpponent = (state: GameState, currentPlayerId: string) =>
    state.players.find((player) => player.id !== currentPlayerId) ?? null;

const toPlayedByGeisha = (cards: ItemCard[] | undefined) =>
    (cards ?? []).reduce<Record<number, string[]>>((acc, card) => {
        const next = acc[card.geishaId] ?? [];
        next.push(card.id);
        acc[card.geishaId] = next;
        return acc;
    }, {});

export const buildMotionSnapshot = (state: GameState, currentPlayerId: string): MotionSnapshot => {
    const currentPlayer = state.players.find((player) => player.id === currentPlayerId) ?? null;
    const opponent = getOpponent(state, currentPlayerId);

    return {
        currentPlayerId,
        myHandCardIds: currentPlayer?.hand.map((card) => card.id) ?? [],
        myHandCount: currentPlayer?.hand.length ?? 0,
        opponentHandCount: opponent?.hand.length ?? 0,
        myPlayedByGeisha: toPlayedByGeisha(currentPlayer?.playedCards),
        opponentPlayedByGeisha: toPlayedByGeisha(opponent?.playedCards),
        pendingInteraction: state.pendingInteraction
    };
};

const getAddedCards = (
    previous: Record<number, string[]>,
    current: Record<number, string[]>
) => {
    const geishaIds = new Set<number>([
        ...Object.keys(previous).map(Number),
        ...Object.keys(current).map(Number)
    ]);

    return Array.from(geishaIds)
        .sort((a, b) => a - b)
        .flatMap((geishaId) => {
            const prevIds = new Set(previous[geishaId] ?? []);
            const currentIds = current[geishaId] ?? [];

            return currentIds
                .filter((cardId) => !prevIds.has(cardId))
                .map((cardId) => ({ geishaId, cardId }));
        });
};

const resolveResultCueKind = (interaction: PendingInteraction | null): MotionCueKind | null => {
    if (!interaction) {
        return null;
    }

    if (interaction.type === 'GIFT_SELECTION') {
        return 'gift-result';
    }

    if (interaction.type === 'COMPETITION_SELECTION') {
        return 'competition-result';
    }

    return null;
};

const resolveSourceZone = (kind: MotionCueKind, owner: MotionOwner): MotionSourceZone => {
    if (kind === 'gift-result') {
        return 'gift-modal';
    }

    if (kind === 'competition-result') {
        return 'competition-modal';
    }

    return owner === 'self' ? 'hand' : 'opponent-side';
};

export const prepareMotionQueue = (cues: MotionCue[], now = Date.now()): MotionCue[] =>
    cues
        .sort((a, b) => {
            const byPriority = CUE_PRIORITY[a.kind] - CUE_PRIORITY[b.kind];
            if (byPriority !== 0) {
                return byPriority;
            }

            const byGeisha = (a.targetGeishaId ?? 0) - (b.targetGeishaId ?? 0);
            if (byGeisha !== 0) {
                return byGeisha;
            }

            return a.owner.localeCompare(b.owner);
        })
        .map((cue, index) => ({
            ...cue,
            createdAt: now,
            delayMs: index * 90
        }));

export const deriveMotionCues = (
    previous: MotionSnapshot,
    current: MotionSnapshot,
    prefersReducedMotion: boolean
): MotionCue[] => {
    const now = Date.now();
    const resolutionKind = resolveResultCueKind(previous.pendingInteraction);

    const buildCue = (
        kind: MotionCueKind,
        owner: MotionOwner,
        geishaId: number,
        cardId: string
    ): MotionCue => ({
        id: `${kind}:${owner}:${geishaId}:${cardId}:${now}`,
        kind,
        owner,
        cardId,
        geishaId,
        sourceZone: resolveSourceZone(kind, owner),
        targetZone: kind === 'draw' ? 'hand' : 'board',
        targetGeishaId: kind === 'draw' ? undefined : geishaId,
        createdAt: now,
        durationMs: prefersReducedMotion ? 520 : 920,
        delayMs: 0,
        reducedMotion: prefersReducedMotion
    });

    const selfPlacements = getAddedCards(previous.myPlayedByGeisha, current.myPlayedByGeisha).map(({ geishaId, cardId }) =>
        buildCue(resolutionKind ?? 'placement', 'self', geishaId, cardId)
    );
    const opponentPlacements = getAddedCards(previous.opponentPlayedByGeisha, current.opponentPlayedByGeisha).map(({ geishaId, cardId }) =>
        buildCue(resolutionKind ?? 'placement', 'opponent', geishaId, cardId)
    );

    const buildRemovalCue = (owner: MotionOwner, index: number): MotionCue => ({
        id: `removal:${owner}:${index}:${now}`,
        kind: 'removal',
        owner,
        sourceZone: owner === 'self' ? 'hand' : 'opponent-side',
        targetZone: 'hand',
        createdAt: now,
        durationMs: prefersReducedMotion ? 360 : 520,
        delayMs: 0,
        reducedMotion: prefersReducedMotion
    });
    const selfRemovalCount = Math.max(previous.myHandCount - current.myHandCount, 0);
    const opponentRemovalCount = Math.max(previous.opponentHandCount - current.opponentHandCount, 0);
    const selfRemovals = Array.from({ length: selfRemovalCount }, (_, index) => buildRemovalCue('self', index));
    const opponentRemovals = Array.from({ length: opponentRemovalCount }, (_, index) => buildRemovalCue('opponent', index));

    return prepareMotionQueue([...selfRemovals, ...opponentRemovals, ...selfPlacements, ...opponentPlacements], now);
};

export const createDrawMotionCue = (
    cardId: string,
    prefersReducedMotion: boolean
): MotionCue => prepareMotionQueue([{
    id: `draw:self:${cardId}:${Date.now()}`,
    kind: 'draw',
    owner: 'self',
    cardId,
    sourceZone: 'hand',
    targetZone: 'hand',
    createdAt: Date.now(),
    durationMs: getDrawFlipDurationMs(prefersReducedMotion),
    delayMs: 0,
    reducedMotion: prefersReducedMotion
}])[0];

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
    const stepDelayMs = prefersReducedMotion ? OPENING_DEAL_STEP_DELAY_MS.reduced : OPENING_DEAL_STEP_DELAY_MS.normal;
    const durationMs = prefersReducedMotion ? OPENING_DEAL_STEP_DURATION_MS.reduced : OPENING_DEAL_STEP_DURATION_MS.normal;

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

export const usePrefersReducedMotion = () => {
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
            return undefined;
        }

        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        const update = () => setPrefersReducedMotion(mediaQuery.matches);

        update();

        if (typeof mediaQuery.addEventListener === 'function') {
            mediaQuery.addEventListener('change', update);
            return () => mediaQuery.removeEventListener('change', update);
        }

        mediaQuery.addListener(update);
        return () => mediaQuery.removeListener(update);
    }, []);

    return prefersReducedMotion;
};
