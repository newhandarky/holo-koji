import {
    getDealQueueEventKey,
    getOpeningDealModalSequenceId,
    isOpeningPresentationAllowed,
    shouldBuildOpeningDealModalModel
} from './openingDealPresentationModel';

const makeOpeningDeal = () => ({
    sequenceId: 'opening-sequence-1',
    status: 'completed' as const,
    completed: true,
    replayable: true,
    steps: [
        { type: 'DEAL_CARD_BACK' as const, order: 0, targetPlayerId: 'p1', cardIndex: 0 }
    ]
});

describe('openingDealPresentationModel', () => {
    test('builds a stable deal queue key from public deal event fields', () => {
        expect(getDealQueueEventKey({
            sequence: [
                { order: 1, playerId: 'p1', card: { id: 'card-1', geishaId: 1, type: 'item' } },
                { order: 2, playerId: 'p2', card: { id: 'hidden-1', geishaId: 0, type: 'hidden' } }
            ]
        })).toBe('1:p1:card-1:item|2:p2:hidden-1:hidden');
    });

    test('allows opening presentation only after order decision is closed in playing phase', () => {
        expect(isOpeningPresentationAllowed({
            phase: 'deciding_order',
            orderDecision: { isOpen: true }
        } as any)).toBe(false);
        expect(isOpeningPresentationAllowed({
            phase: 'playing',
            orderDecision: { isOpen: true }
        } as any)).toBe(false);
        expect(isOpeningPresentationAllowed({
            phase: 'playing',
            orderDecision: { isOpen: false }
        } as any)).toBe(true);
    });

    test('returns modal sequence id only for replayable uncompleted opening deal presentation', () => {
        const openingDeal = makeOpeningDeal();

        expect(getOpeningDealModalSequenceId({
            openingDeal,
            currentPlayerId: 'p1',
            presentationAllowed: true,
            completedSequenceIds: new Set()
        })).toBe('opening-sequence-1');
        expect(getOpeningDealModalSequenceId({
            openingDeal,
            currentPlayerId: 'p1',
            presentationAllowed: true,
            completedSequenceIds: new Set(['opening-sequence-1'])
        })).toBeNull();
    });

    test('narrows modal model availability to the active replayable sequence', () => {
        const openingDeal = makeOpeningDeal();

        expect(shouldBuildOpeningDealModalModel(openingDeal, 'opening-sequence-1')).toBe(true);
        expect(shouldBuildOpeningDealModalModel(openingDeal, 'other-sequence')).toBe(false);
        expect(shouldBuildOpeningDealModalModel(undefined, 'opening-sequence-1')).toBe(false);
    });
});
