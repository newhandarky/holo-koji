import { fireEvent, render, screen } from '@testing-library/react';
import { GameAction, GameState, ItemCard, Player } from '@newhandarky/hanakoji-game-types';
import GameBoard from './GameBoard';
import { OpeningHandRevealModel } from './openingHandRevealModel';

const makeCard = (id: string, geishaId: number): ItemCard => ({
    id,
    geishaId,
    type: 'sake_01',
    itemImageUrl: `/cards/${id}.png`,
    itemLabel: `卡片 ${id}`
} as ItemCard);

const makePlayer = (id: string, hand: ItemCard[] = []): Player => ({
    id,
    name: id,
    hand,
    playedCards: [],
    secretCards: [],
    discardedCards: [],
    actionTokens: [
        { type: 'secret', used: false },
        { type: 'trade-off', used: false },
        { type: 'gift', used: false },
        { type: 'competition', used: false }
    ],
    score: { charm: 0, tokens: 0 }
} as Player);

const makeState = (players: Player[] = [
    makePlayer('p1', [makeCard('card-1', 1), makeCard('card-2', 2), makeCard('card-3', 3), makeCard('card-4', 4)]),
    makePlayer('p2')
]): GameState => ({
    id: 'game-1',
    players,
    geishas: [
        { id: 1, name: '藝妓 1', charmPoints: 2, imageUrl: '', controlledBy: null },
        { id: 2, name: '藝妓 2', charmPoints: 2, imageUrl: '', controlledBy: null },
        { id: 3, name: '藝妓 3', charmPoints: 3, imageUrl: '', controlledBy: null },
        { id: 4, name: '藝妓 4', charmPoints: 3, imageUrl: '', controlledBy: null }
    ],
    currentPlayer: 0,
    round: 1,
    phase: 'playing',
    deck: [],
    discardedCards: [],
    removedCard: null,
    pendingInteraction: null,
    geishaSet: 'default'
} as unknown as GameState);

const blockedOpeningHandReveal: OpeningHandRevealModel = {
    status: 'revealing',
    isEligible: true,
    isConcealed: true,
    isInteractionBlocked: true,
    totalCount: 4,
    revealedCount: 0,
    reducedMotion: false,
    sequenceId: 'sequence-1',
    steps: ['card-1', 'card-2', 'card-3', 'card-4'].map((cardId, index) => ({
        cardId,
        index,
        delayMs: 0,
        durationMs: 120,
        visible: false
    }))
};

const renderGameBoard = ({
    state = makeState(),
    playerId = 'p1',
    canAct = true,
    onSendAction = jest.fn(),
    openingHandReveal = null
}: {
    state?: GameState;
    playerId?: string;
    canAct?: boolean;
    onSendAction?: (action: GameAction) => void;
    openingHandReveal?: OpeningHandRevealModel | null;
} = {}) => {
    const view = render(
        <GameBoard
            state={state}
            playerId={playerId}
            hostId="p1"
            onSendAction={onSendAction}
            canAct={canAct}
            focusSection="handActions"
            openingHandReveal={openingHandReveal}
        />
    );
    return { ...view, onSendAction };
};

const selectHandCards = (container: HTMLElement, count: number) => {
    const cardButtons = Array.from(container.querySelectorAll<HTMLButtonElement>('.item-card--hand'));
    cardButtons.slice(0, count).forEach((button) => fireEvent.click(button));
};

describe('GameBoard', () => {
    test('renders null when current player state is missing', () => {
        const { container } = renderGameBoard({
            state: makeState([makePlayer('p2')]),
            playerId: 'p1'
        });

        expect(container.firstChild).toBeNull();
    });

    test('does not send action while not current player turn', () => {
        const state = makeState();
        state.currentPlayer = 1;
        const { container, onSendAction } = renderGameBoard({ state, canAct: true });

        selectHandCards(container, 1);
        fireEvent.click(screen.getByRole('button', { name: 'secret' }));

        expect(onSendAction).not.toHaveBeenCalled();
    });

    test('does not send action while opening hand interaction is blocked', () => {
        const { container, onSendAction } = renderGameBoard({
            openingHandReveal: blockedOpeningHandReveal
        });

        selectHandCards(container, 1);
        fireEvent.click(screen.getByRole('button', { name: 'secret' }));

        expect(onSendAction).not.toHaveBeenCalled();
    });

    test('opens competition modal and sends selected grouping payload', () => {
        const { container, onSendAction } = renderGameBoard();

        selectHandCards(container, 4);
        fireEvent.click(screen.getByRole('button', { name: 'competition' }));

        expect(screen.getByText('請選擇要提供給對手的分組方式（對手會從兩組中選 1 組）：')).toBeInTheDocument();

        fireEvent.click(screen.getAllByRole('button', { name: '使用此分組' })[0]);

        expect(onSendAction).toHaveBeenCalledWith({
            type: 'INITIATE_COMPETITION',
            payload: {
                playerId: 'p1',
                groups: [['card-1', 'card-2'], ['card-3', 'card-4']]
            }
        });
    });
});
