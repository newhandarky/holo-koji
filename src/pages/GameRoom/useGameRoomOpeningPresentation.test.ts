import { act, renderHook } from '@testing-library/react';
import type { FocusSection } from '../../components/game/GameBoard';
import { useGameRoomOpeningPresentation } from './useGameRoomOpeningPresentation';

const makePlayer = (id: string) => ({
    id,
    name: id,
    avatarUrl: '',
    hand: Array.from({ length: 6 }, (_, index) => ({
        id: `${id}-card-${index + 1}`,
        geishaId: index + 1,
        type: 'item' as const
    })),
    playedCards: [],
    secretCards: [],
    discardedCards: [],
    actionTokens: [],
    score: { charm: 0, tokens: 0 }
});

const makeState = () => ({
    phase: 'playing',
    round: 1,
    currentPlayer: 0,
    players: [makePlayer('p1'), makePlayer('p2')],
    geishas: [],
    openingDeal: {
        sequenceId: 'opening-sequence-1',
        status: 'completed',
        completed: true,
        replayable: false,
        steps: []
    },
    pendingInteraction: null,
    orderDecision: {
        isOpen: false,
        phase: 'idle',
        players: [],
        result: null,
        confirmations: [],
        waitingFor: []
    }
});

const makeReplayableOpeningDeal = () => ({
    sequenceId: 'opening-sequence-1',
    status: 'completed',
    completed: true,
    replayable: true,
    steps: [
        { type: 'BURN_HIDDEN_CARD' as const, order: 0, targetZone: 'hidden-reserve' as const },
        { type: 'DEAL_CARD_BACK' as const, order: 1, targetPlayerId: 'p1', cardIndex: 1 },
        { type: 'DEAL_CARD_BACK' as const, order: 2, targetPlayerId: 'p2', cardIndex: 1 },
        { type: 'OPENING_DEAL_COMPLETE' as const, order: 3 }
    ]
});

describe('useGameRoomOpeningPresentation', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    test('plays queued opening deal cue steps and consumes the event after duration', () => {
        const consumeDealEvent = jest.fn();
        const { result } = renderHook(() => useGameRoomOpeningPresentation({
            state: makeState() as any,
            roomId: 'ROOM01',
            currentPlayerId: 'p1',
            currentPlayer: makePlayer('p1') as any,
            dealQueue: [{
                sequence: [
                    { order: 1, playerId: 'p1', card: { id: 'deal-card-1', geishaId: 1, type: 'item' as const } }
                ]
            }],
            consumeDealEvent,
            prefersReducedMotion: true,
            setFocusSection: jest.fn()
        }));

        expect(result.current.activeOpeningDealSteps.length).toBeGreaterThan(0);

        act(() => {
            jest.runOnlyPendingTimers();
        });

        expect(consumeDealEvent).toHaveBeenCalledTimes(1);
    });

    test('defers opening deal presentation while order decision is still open', () => {
        const consumeDealEvent = jest.fn();
        const state = makeState() as any;
        state.phase = 'deciding_order';
        state.orderDecision = {
            isOpen: true,
            phase: 'waiting_confirmation',
            players: ['p1', 'p2'],
            result: {
                firstPlayer: 'p1',
                secondPlayer: 'p2',
                order: ['p1', 'p2']
            },
            confirmations: ['p1'],
            waitingFor: ['p2']
        };
        state.openingDeal = makeReplayableOpeningDeal();

        const { result, rerender } = renderHook(() => useGameRoomOpeningPresentation({
            state,
            roomId: 'ROOM01',
            currentPlayerId: 'p1',
            currentPlayer: state.players[0],
            dealQueue: [{
                sequence: [
                    { order: 1, playerId: 'p1', card: { id: 'deal-card-1', geishaId: 1, type: 'item' as const } }
                ]
            }],
            consumeDealEvent,
            prefersReducedMotion: true,
            setFocusSection: jest.fn()
        }));

        expect(result.current.activeOpeningDealSteps).toEqual([]);
        expect(result.current.openingDealModalModel).toBeNull();
        expect(result.current.openingHandRevealModel.isEligible).toBe(false);
        expect(consumeDealEvent).not.toHaveBeenCalled();

        state.phase = 'playing';
        state.orderDecision = {
            ...state.orderDecision,
            isOpen: false,
            phase: 'result',
            confirmations: ['p1', 'p2'],
            waitingFor: []
        };
        rerender();

        expect(result.current.openingDealModalModel?.sequenceId).toBe('opening-sequence-1');
        expect(consumeDealEvent).toHaveBeenCalledTimes(1);
    });

    test('opening hand take blocks until player reveals current hand', () => {
        let focusSection: FocusSection = 'characterBoard';
        const setFocusSection = jest.fn((next: FocusSection | ((current: FocusSection) => FocusSection)) => {
            focusSection = typeof next === 'function' ? next(focusSection) : next;
        });
        const state = makeState() as any;
        const { result } = renderHook(() => useGameRoomOpeningPresentation({
            state,
            roomId: 'ROOM01',
            currentPlayerId: 'p1',
            currentPlayer: state.players[0],
            dealQueue: [],
            consumeDealEvent: jest.fn(),
            prefersReducedMotion: true,
            setFocusSection
        }));

        expect(result.current.openingHandRevealModel.isEligible).toBe(true);
        expect(result.current.openingHandRevealModel.status).toBe('pending_take');
        expect(result.current.isOpeningHandRevealBlocking).toBe(true);

        act(() => {
            result.current.handleTakeOpeningHand();
        });

        expect(result.current.openingHandRevealModel.status).toBe('revealed');
        expect(setFocusSection).toHaveBeenCalledWith('handActions');
    });
});
