import { renderHook } from '@testing-library/react';
import type { GameState } from '@newhandarky/hanakoji-game-types';
import type { FocusSection } from '../../components/game/GameBoard';
import { useGameRoomEventReactions } from './useGameRoomEventReactions';
import { frontendLogger } from '../../utils/runtimeLogger';

jest.mock('../../utils/runtimeLogger', () => ({
    frontendLogger: {
        diagnostic: jest.fn()
    },
    summarizeGameState: jest.fn(() => ({ phase: 'playing' }))
}));

const makeState = (phase: GameState['phase'] = 'playing'): GameState => ({
    gameId: 'ROOM01',
    phase,
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
        players: [],
        result: null,
        confirmations: [],
        waitingFor: []
    }
} as unknown as GameState);

const renderEventReactions = (overrides: Partial<Parameters<typeof useGameRoomEventReactions>[0]> = {}) => {
    let focusSection: FocusSection = 'characterBoard';
    const setFocusSection = jest.fn((next: FocusSection | ((current: FocusSection) => FocusSection)) => {
        focusSection = typeof next === 'function' ? next(focusSection) : next;
    });

    const baseOptions: Parameters<typeof useGameRoomEventReactions>[0] = {
        state: makeState(),
        roomId: 'ROOM01',
        currentPlayerId: 'p1',
        isConnected: true,
        isRematchRequested: false,
        setIsRematchRequested: jest.fn(),
        setIsEndSheetCollapsed: jest.fn(),
        focusSection,
        setFocusSection,
        canAct: false,
        isInteractionLocked: false,
        isOpeningDealModalActive: false,
        prefersReducedMotion: true
    };

    return {
        setFocusSection,
        hook: renderHook((props: Parameters<typeof useGameRoomEventReactions>[0]) => useGameRoomEventReactions(props), {
            initialProps: { ...baseOptions, ...overrides }
        })
    };
};

describe('useGameRoomEventReactions', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('logs a safe diagnostic game state summary', () => {
        renderEventReactions();

        expect(frontendLogger.diagnostic).toHaveBeenCalledWith(
            '🐞 [GameRoom] 狀態摘要',
            expect.objectContaining({
                roomId: 'ROOM01',
                currentPlayerId: 'p1'
            })
        );
    });

    test('resets rematch and end sheet state when a new game is active', () => {
        const setIsRematchRequested = jest.fn();
        const setIsEndSheetCollapsed = jest.fn();

        renderEventReactions({
            isRematchRequested: true,
            setIsRematchRequested,
            setIsEndSheetCollapsed,
            state: makeState('playing')
        });

        expect(setIsRematchRequested).toHaveBeenCalledWith(false);
        expect(setIsEndSheetCollapsed).toHaveBeenCalledWith(false);
    });

    test('returns focus to character board when leaving playing phase', () => {
        const { setFocusSection } = renderEventReactions({
            state: makeState('waiting')
        });

        expect(setFocusSection).toHaveBeenCalledWith('characterBoard');
    });

    test('moves focus to hand actions when player becomes actionable after a block', () => {
        const { hook, setFocusSection } = renderEventReactions({
            focusSection: 'characterBoard',
            canAct: false,
            isInteractionLocked: true
        });

        hook.rerender({
            ...hook.result.current,
            state: makeState(),
            roomId: 'ROOM01',
            currentPlayerId: 'p1',
            isConnected: true,
            isRematchRequested: false,
            setIsRematchRequested: jest.fn(),
            setIsEndSheetCollapsed: jest.fn(),
            focusSection: 'characterBoard',
            setFocusSection,
            canAct: true,
            isInteractionLocked: false,
            isOpeningDealModalActive: false,
            prefersReducedMotion: true
        } as Parameters<typeof useGameRoomEventReactions>[0]);

        expect(setFocusSection).toHaveBeenCalledWith('handActions');
    });
});
