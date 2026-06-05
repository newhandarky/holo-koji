import { GameState, ItemCard, PendingInteraction } from '@newhandarky/hanakoji-game-types';
import {
    prepareMotionQueue,
    resolveMotionSourceZone,
    type MotionCue,
    type MotionCueKind,
    type MotionOwner
} from './gameMotionModel';

export interface MotionSnapshot {
    currentPlayerId: string;
    myHandCardIds: string[];
    myHandCount: number;
    opponentHandCount: number;
    myPlayedByGeisha: Record<number, string[]>;
    opponentPlayedByGeisha: Record<number, string[]>;
    pendingInteraction: PendingInteraction | null;
}

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
        sourceZone: resolveMotionSourceZone(kind, owner),
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
