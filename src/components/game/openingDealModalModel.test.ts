import type { OpeningDealSummary, Player } from '@newhandarky/hanakoji-game-types';
import {
    buildOpeningDealModalModel,
    getOpeningDealModalTotalMs
} from './openingDealModalModel';

const players: Player[] = [
    {
        id: 'p1',
        name: '玩家一',
        hand: [],
        playedCards: [],
        secretCards: [],
        discardedCards: [],
        actionTokens: [],
        score: { charm: 0, tokens: 0 }
    },
    {
        id: 'p2',
        name: '玩家二',
        hand: [],
        playedCards: [],
        secretCards: [],
        discardedCards: [],
        actionTokens: [],
        score: { charm: 0, tokens: 0 }
    }
];

const makeOpeningDeal = (): OpeningDealSummary => ({
    sequenceId: 'opening-room-1-round-1',
    status: 'completed',
    completed: true,
    replayable: true,
    steps: [
        { type: 'BURN_HIDDEN_CARD', order: 0, targetZone: 'hidden-reserve' },
        ...Array.from({ length: 6 }, (_, index) => ([
            { type: 'DEAL_CARD_BACK' as const, order: index * 2 + 1, targetPlayerId: 'p1', cardIndex: index + 1 },
            { type: 'DEAL_CARD_BACK' as const, order: index * 2 + 2, targetPlayerId: 'p2', cardIndex: index + 1 }
        ])).flat(),
        { type: 'OPENING_DEAL_COMPLETE', order: 13 }
    ]
});

describe('openingDealModalModel', () => {
    test('builds burn, alternating deal, and complete steps from safe opening deal metadata', () => {
        const model = buildOpeningDealModalModel(makeOpeningDeal(), players, 'p1', false);

        expect(model.sequenceId).toBe('opening-room-1-round-1');
        expect(model.steps).toHaveLength(14);
        expect(model.steps[0]).toMatchObject({
            type: 'BURN_HIDDEN_CARD',
            targetZone: 'hidden-reserve',
            viewerRole: 'neutral',
            turnRole: 'neutral'
        });
        expect(model.steps.slice(1, 5).map((step) => `${step.type}:${step.targetPlayerId}:${step.cardIndex}:${step.viewerRole}`)).toEqual([
            'DEAL_CARD_BACK:p1:1:self',
            'DEAL_CARD_BACK:p2:1:opponent',
            'DEAL_CARD_BACK:p1:2:self',
            'DEAL_CARD_BACK:p2:2:opponent'
        ]);
        expect(model.steps.slice(1, 5).map((step) => `${step.targetPlayerId}:${step.turnRole}`)).toEqual([
            'p1:first',
            'p2:second',
            'p1:first',
            'p2:second'
        ]);
        expect(model.steps[13]).toMatchObject({ type: 'OPENING_DEAL_COMPLETE' });
    });

    test('derives first and second player roles from reversed deal order', () => {
        const openingDeal = makeOpeningDeal();
        openingDeal.steps = [
            { type: 'BURN_HIDDEN_CARD', order: 0, targetZone: 'hidden-reserve' },
            { type: 'DEAL_CARD_BACK', order: 1, targetPlayerId: 'p2', cardIndex: 1 },
            { type: 'DEAL_CARD_BACK', order: 2, targetPlayerId: 'p1', cardIndex: 1 },
            { type: 'OPENING_DEAL_COMPLETE', order: 3 }
        ];

        const model = buildOpeningDealModalModel(openingDeal, players, 'p1', false);

        expect(model.steps.filter((step) => step.type === 'DEAL_CARD_BACK').map((step) => `${step.targetPlayerId}:${step.turnRole}:${step.viewerRole}`)).toEqual([
            'p2:first:opponent',
            'p1:second:self'
        ]);
    });

    test('does not copy forbidden card identity fields into modal model output', () => {
        const unsafeOpeningDeal = makeOpeningDeal() as OpeningDealSummary & {
            removedCard?: unknown;
            card?: unknown;
        };
        unsafeOpeningDeal.removedCard = { id: 'removed-card', geishaId: 7, itemLabel: '秘密牌' };
        unsafeOpeningDeal.card = { id: 'hand-card', itemImageUrl: '/secret.png' };

        const model = buildOpeningDealModalModel(unsafeOpeningDeal, players, 'p1', false);
        const serialized = JSON.stringify(model);

        expect(serialized).not.toContain('removed-card');
        expect(serialized).not.toContain('hand-card');
        expect(serialized).not.toContain('geishaId');
        expect(serialized).not.toContain('itemLabel');
        expect(serialized).not.toContain('itemImageUrl');
    });

    test('keeps normal animation total within six seconds and reduced motion within two seconds', () => {
        const normal = buildOpeningDealModalModel(makeOpeningDeal(), players, 'p1', false);
        const reduced = buildOpeningDealModalModel(makeOpeningDeal(), players, 'p1', true);

        expect(getOpeningDealModalTotalMs(normal)).toBeLessThanOrEqual(6000);
        expect(getOpeningDealModalTotalMs(reduced)).toBeLessThanOrEqual(2000);
        expect(getOpeningDealModalTotalMs(reduced)).toBeLessThan(getOpeningDealModalTotalMs(normal));
    });
});
