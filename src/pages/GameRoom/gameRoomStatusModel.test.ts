import { buildGameRoomStatusModel } from './gameRoomStatusModel';
import type { GameState } from '@newhandarky/hanakoji-game-types';

const makeState = (overrides: Partial<GameState> = {}): GameState => ({
    gameId: 'ROOM01',
    phase: 'playing',
    round: 1,
    currentPlayer: 0,
    players: [
        {
            id: 'p1',
            name: 'p1',
            avatarUrl: '',
            hand: [],
            playedCards: [],
            secretCards: [],
            discardedCards: [],
            actionTokens: [],
            score: { charm: 0, tokens: 0 }
        },
        {
            id: 'p2',
            name: 'p2',
            avatarUrl: '',
            hand: [],
            playedCards: [],
            secretCards: [],
            discardedCards: [],
            actionTokens: [],
            score: { charm: 0, tokens: 0 }
        }
    ],
    geishas: [],
    deck: [],
    drawPile: [],
    discardPile: [],
    removedCard: null,
    pendingInteraction: null,
    geishaSet: 'default',
    orderDecision: {
        isOpen: false,
        phase: 'idle',
        currentPlayer: null,
        players: [],
        result: null,
        confirmations: [],
        waitingFor: []
    },
    ...overrides
} as unknown as GameState);

const buildStatus = (state: GameState, overrides = {}) => buildGameRoomStatusModel({
    state,
    currentPlayerId: 'p1',
    isOpeningDealActive: false,
    isOpeningHandRevealBlocking: false,
    hasRoundSummary: false,
    hasReadyStatus: false,
    ...overrides
});

describe('gameRoomStatusModel', () => {
    test('marks player actionable only during own playing turn without blockers', () => {
        expect(buildStatus(makeState())).toMatchObject({
            isMyTurn: true,
            canAct: true,
            isInteractionLocked: false,
            activeTurnPlayerId: 'p1'
        });
    });

    test('marks waiting if phase is waiting or room has fewer than two players', () => {
        expect(buildStatus(makeState({ phase: 'waiting' }))).toMatchObject({ isWaiting: true });
        expect(buildStatus(makeState({ players: [makeState().players[0]] }))).toMatchObject({ isWaiting: true });
    });

    test('locks interaction during pending response and marks target viewer', () => {
        expect(buildStatus(makeState({
            pendingInteraction: {
                type: 'GIFT_SELECTION',
                initiatorId: 'p2',
                sourcePlayerId: 'p2',
                targetPlayerId: 'p1',
                offeredCards: []
            }
        } as Partial<GameState>))).toMatchObject({
            needsResponse: true,
            isInteractionLocked: true,
            canAct: false
        });
    });

    test('locks interaction for non-pending blockers', () => {
        expect(buildStatus(makeState(), { hasRoundSummary: true })).toMatchObject({
            isInteractionLocked: true,
            canAct: true
        });

        expect(buildStatus(makeState({ phase: 'ended' }))).toMatchObject({
            isGameEnded: true,
            isInteractionLocked: true,
            canAct: false
        });
    });
});
