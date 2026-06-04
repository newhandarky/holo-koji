import {
    prepareMotionQueue,
    resolveMotionSourceZone,
    type MotionCue
} from './gameMotionModel';

const makeCue = (overrides: Partial<MotionCue>): MotionCue => ({
    id: overrides.id ?? 'cue',
    kind: overrides.kind ?? 'placement',
    owner: overrides.owner ?? 'self',
    sourceZone: overrides.sourceZone ?? 'hand',
    targetZone: overrides.targetZone ?? 'board',
    createdAt: 0,
    durationMs: 920,
    delayMs: 0,
    reducedMotion: false,
    ...overrides
});

describe('gameMotionModel', () => {
    test('orders cues by lifecycle priority, geisha target and owner', () => {
        const queued = prepareMotionQueue([
            makeCue({ id: 'placement-opponent', kind: 'placement', owner: 'opponent', targetGeishaId: 2 }),
            makeCue({ id: 'removal-self', kind: 'removal', owner: 'self' }),
            makeCue({ id: 'placement-self', kind: 'placement', owner: 'self', targetGeishaId: 1 }),
            makeCue({ id: 'gift-result', kind: 'gift-result', owner: 'self', targetGeishaId: 1 })
        ], 1234);

        expect(queued.map((cue) => cue.id)).toEqual([
            'removal-self',
            'placement-self',
            'placement-opponent',
            'gift-result'
        ]);
        expect(queued.map((cue) => cue.createdAt)).toEqual([1234, 1234, 1234, 1234]);
        expect(queued.map((cue) => cue.delayMs)).toEqual([0, 90, 180, 270]);
    });

    test('resolves modal source zones for interaction result cues', () => {
        expect(resolveMotionSourceZone('gift-result', 'self')).toBe('gift-modal');
        expect(resolveMotionSourceZone('competition-result', 'opponent')).toBe('competition-modal');
        expect(resolveMotionSourceZone('placement', 'self')).toBe('hand');
        expect(resolveMotionSourceZone('placement', 'opponent')).toBe('opponent-side');
    });
});
