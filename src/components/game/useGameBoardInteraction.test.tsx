import { act, renderHook } from '@testing-library/react';
import { ItemCard, Player } from '@newhandarky/hanakoji-game-types';
import { useGameBoardInteraction } from './useGameBoardInteraction';

const makeCard = (id: string, geishaId: number): ItemCard => ({
    id,
    geishaId,
    type: 'sake_01',
    itemImageUrl: `/cards/${id}.png`,
    itemLabel: `卡片 ${id}`
} as ItemCard);

const cards = [
    makeCard('card-1', 1),
    makeCard('card-2', 2),
    makeCard('card-3', 3),
    makeCard('card-4', 4)
];

const makePlayer = (hand: ItemCard[] = cards): Player => ({
    id: 'p1',
    name: '玩家一',
    hand,
    playedCards: [],
    secretCards: [],
    discardedCards: [],
    actionTokens: [],
    score: { charm: 0, tokens: 0 }
} as Player);

describe('useGameBoardInteraction', () => {
    beforeEach(() => {
        jest.spyOn(window, 'alert').mockImplementation(() => undefined);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('does not send actions when it is not the player turn', () => {
        const onSendAction = jest.fn();
        const { result } = renderHook(() => useGameBoardInteraction({
            playerId: 'p1',
            myState: makePlayer(),
            isMyTurn: false,
            isOpeningHandInteractionBlocked: false,
            onSendAction
        }));

        act(() => {
            result.current.handleCardSelect([cards[0]]);
        });
        act(() => {
            result.current.handleAction('secret');
        });

        expect(onSendAction).not.toHaveBeenCalled();
        expect(window.alert).not.toHaveBeenCalled();
    });

    test('sends selected secret action and keeps existing payload shape', () => {
        const onSendAction = jest.fn();
        const { result } = renderHook(() => useGameBoardInteraction({
            playerId: 'p1',
            myState: makePlayer(),
            isMyTurn: true,
            isOpeningHandInteractionBlocked: false,
            onSendAction
        }));

        act(() => {
            result.current.handleCardSelect([cards[0]]);
        });
        act(() => {
            result.current.handleAction('secret');
        });

        expect(onSendAction).toHaveBeenCalledWith({
            type: 'PLAY_SECRET',
            payload: {
                playerId: 'p1',
                cardId: 'card-1'
            }
        });
    });

    test('opens competition modal and confirms grouping payload', () => {
        const onSendAction = jest.fn();
        const { result } = renderHook(() => useGameBoardInteraction({
            playerId: 'p1',
            myState: makePlayer(),
            isMyTurn: true,
            isOpeningHandInteractionBlocked: false,
            onSendAction
        }));

        act(() => {
            result.current.handleCardSelect(cards);
        });
        act(() => {
            result.current.handleAction('competition');
        });

        expect(result.current.isCompetitionModalOpen).toBe(true);
        expect(result.current.competitionCards).toEqual(cards);

        act(() => {
            result.current.handleCompetitionConfirm([
                ['card-1', 'card-2'],
                ['card-3', 'card-4']
            ]);
        });

        expect(onSendAction).toHaveBeenCalledWith({
            type: 'INITIATE_COMPETITION',
            payload: {
                playerId: 'p1',
                groups: [['card-1', 'card-2'], ['card-3', 'card-4']]
            }
        });
        expect(result.current.isCompetitionModalOpen).toBe(false);
        expect(result.current.competitionCards).toEqual([]);
    });

    test('opening hand block prevents card selection and competition confirmation', () => {
        const onSendAction = jest.fn();
        const { result } = renderHook(() => useGameBoardInteraction({
            playerId: 'p1',
            myState: makePlayer(),
            isMyTurn: true,
            isOpeningHandInteractionBlocked: true,
            onSendAction
        }));

        act(() => {
            result.current.handleCardSelect(cards);
            result.current.handleAction('competition');
            result.current.handleCompetitionConfirm([
                ['card-1', 'card-2'],
                ['card-3', 'card-4']
            ]);
        });

        expect(result.current.isCompetitionModalOpen).toBe(false);
        expect(result.current.competitionCards).toEqual([]);
        expect(onSendAction).not.toHaveBeenCalled();
    });
});
