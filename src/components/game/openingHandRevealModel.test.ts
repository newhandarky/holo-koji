import type { ActionToken, GameState, ItemCard } from 'game-shared-types';
import {
    buildOpeningHandRevealModel,
    createOpeningHandRevealSteps,
    getOpeningHandRevealTotalMs,
    getOpeningHandTakeEligibility
} from './openingHandRevealModel';

const makeCard = (index: number): ItemCard => ({
    id: `own-card-${index}`,
    geishaId: index,
    type: 'item',
    itemLabel: `秘密道具 ${index}`,
    itemImageUrl: `/secret-${index}.png`
});

const makeTokens = (usedType?: ActionToken['type']): ActionToken[] => ([
    { type: 'secret', used: usedType === 'secret' },
    { type: 'trade-off', used: usedType === 'trade-off' },
    { type: 'gift', used: usedType === 'gift' },
    { type: 'competition', used: usedType === 'competition' }
]);

const makeState = (overrides: Partial<GameState> = {}): GameState => ({
    gameId: 'game-1',
    phase: 'playing',
    round: 1,
    currentPlayer: 0,
    winner: undefined,
    geishas: [],
    geishaSet: 'default',
    players: [
        {
            id: 'p1',
            name: '玩家一',
            hand: Array.from({ length: 6 }, (_, index) => makeCard(index + 1)),
            playedCards: [],
            secretCards: [],
            discardedCards: [],
            actionTokens: makeTokens(),
            score: { charm: 0, tokens: 0 }
        },
        {
            id: 'p2',
            name: '玩家二',
            hand: [],
            playedCards: [],
            secretCards: [],
            discardedCards: [],
            actionTokens: makeTokens(),
            score: { charm: 0, tokens: 0 }
        }
    ],
    orderDecision: {
        isOpen: false,
        phase: 'deciding',
        players: [],
        confirmations: [],
        waitingFor: [],
        currentPlayer: 'p1'
    },
    drawPile: [],
    discardPile: [],
    openingDeal: {
        sequenceId: 'opening-1',
        status: 'completed',
        completed: true,
        replayable: true,
        steps: []
    },
    pendingInteraction: null,
    ...overrides
});

describe('openingHandRevealModel', () => {
    test('marks opening take eligible for a completed opening deal with starting hand and unused actions', () => {
        const eligibility = getOpeningHandTakeEligibility(makeState(), 'p1');

        expect(eligibility).toMatchObject({
            openingDealCompleted: true,
            phaseIsPlaying: true,
            ownHandCount: 6,
            isStartingHandCount: true,
            hasUsedAnyActionToken: false,
            hasPendingInteraction: false,
            isEligible: true,
            sequenceId: 'opening-1'
        });
    });

    test('keeps opening take eligible after replay is marked not replayable by an opponent action', () => {
        const eligibility = getOpeningHandTakeEligibility(makeState({
            openingDeal: {
                sequenceId: 'opening-1',
                status: 'not_replayable',
                completed: true,
                replayable: false,
                steps: []
            }
        }), 'p1');

        expect(eligibility).toMatchObject({
            openingDealCompleted: true,
            isEligible: true,
            sequenceId: 'opening-1'
        });
    });

    test('rejects non-playing phase, non-starting hand, used actions, and pending interaction', () => {
        expect(getOpeningHandTakeEligibility(makeState({ phase: 'ended' }), 'p1').isEligible).toBe(false);

        const shortHandState = makeState();
        shortHandState.players[0].hand = shortHandState.players[0].hand.slice(0, 5);
        expect(getOpeningHandTakeEligibility(shortHandState, 'p1').isEligible).toBe(false);

        const usedActionState = makeState();
        usedActionState.players[0].actionTokens = makeTokens('secret');
        expect(getOpeningHandTakeEligibility(usedActionState, 'p1').isEligible).toBe(false);

        expect(getOpeningHandTakeEligibility(makeState({
            pendingInteraction: {
                type: 'GIFT_SELECTION',
                initiatorId: 'p1',
                targetPlayerId: 'p2'
            }
        }), 'p1').isEligible).toBe(false);
    });

    test('creates normal reveal steps in current hand order within three seconds', () => {
        const cards = Array.from({ length: 6 }, (_, index) => makeCard(index + 1));
        const steps = createOpeningHandRevealSteps(cards, false);

        expect(steps.map((step) => step.cardId)).toEqual(cards.map((card) => card.id));
        expect(steps.map((step) => step.index)).toEqual([0, 1, 2, 3, 4, 5]);
        expect(getOpeningHandRevealTotalMs(steps, false)).toBeLessThanOrEqual(3000);
    });

    test('reduced motion reveal directly completes within one second', () => {
        const cards = Array.from({ length: 6 }, (_, index) => makeCard(index + 1));
        const steps = createOpeningHandRevealSteps(cards, true);

        expect(steps.every((step) => step.visible)).toBe(true);
        expect(getOpeningHandRevealTotalMs(steps, true)).toBeLessThanOrEqual(1000);
    });

    test('builds concealed and interaction-blocking pending model', () => {
        const state = makeState();
        const eligibility = getOpeningHandTakeEligibility(state, 'p1');
        const model = buildOpeningHandRevealModel({
            eligibility,
            cards: state.players[0].hand,
            status: 'pending_take',
            reducedMotion: false
        });

        expect(model.isConcealed).toBe(true);
        expect(model.isInteractionBlocked).toBe(true);
        expect(model.revealedCount).toBe(0);
    });
});
