import {
    createOpeningDealCueSteps,
    getOpeningDealCueDuration,
    getOpeningDealCueTiming
} from './openingDealCueModel';

describe('openingDealCueModel', () => {
    test('exposes lower timing values for reduced motion', () => {
        const normal = getOpeningDealCueTiming(false);
        const reduced = getOpeningDealCueTiming(true);

        expect(reduced.stepDelayMs).toBeLessThan(normal.stepDelayMs);
        expect(reduced.durationMs).toBeLessThan(normal.durationMs);
    });

    test('creates ordered viewer-relative cue steps and total duration', () => {
        const steps = createOpeningDealCueSteps([
            { order: 2, playerId: 'p1', card: { id: 'self-card-2', geishaId: 2, type: 'item' } },
            { order: 0, playerId: 'p1', card: { id: 'self-card-1', geishaId: 1, type: 'item' } },
            { order: 1, playerId: 'p2', card: { id: 'hidden-card', geishaId: 0, type: 'hidden' } }
        ], 'p1', false);

        expect(steps.map((step) => step.card.id)).toEqual(['self-card-1', 'hidden-card', 'self-card-2']);
        expect(steps.map((step) => step.owner)).toEqual(['self', 'opponent', 'self']);
        expect(steps[1]).toMatchObject({ isMasked: true, slotIndex: 0, slotCount: 1 });
        expect(getOpeningDealCueDuration(steps)).toBe(steps[2].delayMs + steps[2].durationMs);
    });
});
