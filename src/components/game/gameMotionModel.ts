export type MotionCueKind = 'draw' | 'removal' | 'placement' | 'gift-result' | 'competition-result';
export type MotionOwner = 'self' | 'opponent';
export type MotionSourceZone = 'hand' | 'gift-modal' | 'competition-modal' | 'opponent-side';

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

export const resolveMotionSourceZone = (kind: MotionCueKind, owner: MotionOwner): MotionSourceZone => {
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
