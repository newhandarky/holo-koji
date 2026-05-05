import {
    createDrawMotionCue,
    createOpeningDealCueSteps,
    deriveMotionCues,
    getOpeningDealCueDuration,
    MotionSnapshot
} from './gameMotion';

describe('gameMotion helpers', () => {
    test('createOpeningDealCueSteps preserves alternating owner order and viewer-safe masking', () => {
        const steps = createOpeningDealCueSteps([
            {
                order: 0,
                playerId: 'self',
                card: { id: 'card-1', geishaId: 1, type: 'real' }
            },
            {
                order: 1,
                playerId: 'opponent',
                card: { id: 'hidden-opponent-1', geishaId: 0, type: 'hidden' }
            },
            {
                order: 2,
                playerId: 'self',
                card: { id: 'card-2', geishaId: 2, type: 'real' }
            }
        ], 'self', false);

        expect(steps).toHaveLength(3);
        expect(steps.map((step) => step.owner)).toEqual(['self', 'opponent', 'self']);
        expect(steps[0].slotIndex).toBe(0);
        expect(steps[1].slotIndex).toBe(0);
        expect(steps[2].slotIndex).toBe(1);
        expect(steps[1].isMasked).toBe(true);
        expect(steps[0].delayMs).toBeLessThan(steps[1].delayMs);
    });

    test('createOpeningDealCueSteps normalizes out-of-order sequence by deal order', () => {
        const steps = createOpeningDealCueSteps([
            {
                order: 2,
                playerId: 'self',
                card: { id: 'self-second', geishaId: 2, type: 'real' }
            },
            {
                order: 0,
                playerId: 'self',
                card: { id: 'self-first', geishaId: 1, type: 'real' }
            },
            {
                order: 1,
                playerId: 'opponent',
                card: { id: 'hidden-opponent-1', geishaId: 0, type: 'hidden' }
            }
        ], 'self', false);

        expect(steps.map((step) => step.card.id)).toEqual(['self-first', 'hidden-opponent-1', 'self-second']);
        expect(steps.map((step) => step.owner)).toEqual(['self', 'opponent', 'self']);
        expect(steps[0].slotIndex).toBe(0);
        expect(steps[2].slotIndex).toBe(1);
        expect(steps[0].delayMs).toBeLessThan(steps[1].delayMs);
        expect(steps[1].delayMs).toBeLessThan(steps[2].delayMs);
    });

    test('reduced-motion deal cues remain shorter and lower intensity', () => {
        const normal = createOpeningDealCueSteps([
            { order: 0, playerId: 'self', card: { id: 'card-1', geishaId: 1, type: 'real' } }
        ], 'self', false);
        const reduced = createOpeningDealCueSteps([
            { order: 0, playerId: 'self', card: { id: 'card-1', geishaId: 1, type: 'real' } }
        ], 'self', true);

        expect(reduced[0].reducedMotion).toBe(true);
        expect(reduced[0].durationMs).toBeLessThan(normal[0].durationMs);
        expect(getOpeningDealCueDuration(reduced)).toBeLessThan(getOpeningDealCueDuration(normal));
    });

    test('draw cue is intentionally short and returns immediately to normal hand state', () => {
        const normalCue = createDrawMotionCue('card-1', false);
        const reducedCue = createDrawMotionCue('card-1', true);

        expect(normalCue.kind).toBe('draw');
        expect(normalCue.durationMs).toBeLessThanOrEqual(360);
        expect(reducedCue.durationMs).toBeLessThan(normalCue.durationMs);
    });

    test('hand removal cues are public-safe and do not expose removed card identity', () => {
        const previous: MotionSnapshot = {
            currentPlayerId: 'self',
            myHandCardIds: ['self-card-1', 'self-card-2'],
            myHandCount: 2,
            opponentHandCount: 2,
            myPlayedByGeisha: {},
            opponentPlayedByGeisha: {},
            pendingInteraction: null
        };
        const current: MotionSnapshot = {
            ...previous,
            myHandCardIds: ['self-card-2'],
            myHandCount: 1
        };

        const cues = deriveMotionCues(previous, current, false);

        expect(cues).toHaveLength(1);
        expect(cues[0]).toMatchObject({
            kind: 'removal',
            owner: 'self',
            sourceZone: 'hand',
            targetZone: 'hand'
        });
        expect(cues[0].cardId).toBeUndefined();
        expect(cues[0].geishaId).toBeUndefined();
    });
});
