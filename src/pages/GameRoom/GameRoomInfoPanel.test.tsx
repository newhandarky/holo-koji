import { fireEvent, render, screen } from '@testing-library/react';
import type { GameState, Player } from '@newhandarky/hanakoji-game-types';
import { GameRoomInfoPanel } from './GameRoomInfoPanel';

jest.mock('../../utils/gameData', () => ({
    getItemCardImage: jest.fn((card) => `/cards/${card.id}.png`)
}));

const makePlayer = (overrides: Partial<Player> = {}): Player => ({
    id: 'p1',
    name: '玩家一',
    avatarUrl: '/p1.png',
    hand: [{ id: 'hand-1', geishaId: 1, type: 'real' }],
    playedCards: [],
    secretCards: [{ id: 'secret-card', geishaId: 1, type: 'real', itemImageUrl: '/cards/secret-card.png' }],
    discardedCards: [{ id: 'discarded-card', geishaId: 2, type: 'real', itemImageUrl: '/cards/discarded-card.png' }],
    actionTokens: [
        { type: 'secret', used: true },
        { type: 'trade-off', used: true },
        { type: 'gift', used: false },
        { type: 'competition', used: false }
    ],
    score: { charm: 1, tokens: 2 },
    ...overrides
});

const opponent = makePlayer({
    id: 'p2',
    name: '玩家二',
    avatarUrl: '/p2.png',
    secretCards: [{ id: 'opponent-secret-card', geishaId: 3, type: 'real', itemImageUrl: '/cards/opponent-secret-card.png' }],
    discardedCards: [{ id: 'opponent-discarded-card', geishaId: 4, type: 'real', itemImageUrl: '/cards/opponent-discarded-card.png' }]
});

const makeState = (): GameState => ({
    gameId: 'ROOM01',
    phase: 'playing',
    round: 1,
    geishaSet: 'hololive',
    currentPlayer: 0,
    winner: undefined,
    geishas: [],
    drawPile: [],
    discardPile: [],
    pendingInteraction: null,
    players: [makePlayer(), opponent],
    orderDecision: {
        isOpen: false,
        phase: 'deciding',
        currentPlayer: '',
        players: [],
        result: undefined,
        confirmations: [],
        waitingFor: []
    }
});

const renderPanel = (overrides: Partial<React.ComponentProps<typeof GameRoomInfoPanel>> = {}) => {
    const state = makeState();
    const props: React.ComponentProps<typeof GameRoomInfoPanel> = {
        state,
        currentPlayerId: 'p1',
        currentPlayer: state.players[0],
        hostId: 'p1',
        activeTurnPlayerName: '玩家一',
        displayName: '玩家一',
        activeGeishaSet: 'hololive',
        getPlayerDisplayName: (playerId) => state.players.find((player) => player.id === playerId)?.name ?? '未知玩家',
        getPlayerAvatar: (playerId) => state.players.find((player) => player.id === playerId)?.avatarUrl ?? '',
        onReturnToLobby: jest.fn(),
        ...overrides
    };
    render(<GameRoomInfoPanel {...props} />);
    return props;
};

describe('GameRoomInfoPanel', () => {
    beforeEach(() => {
        jest.spyOn(window, 'confirm').mockReturnValue(true);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('shows active turn status and player badges', () => {
        renderPanel();

        expect(screen.getByText('你的回合')).toBeInTheDocument();
        expect(screen.getByText('進行中')).toBeInTheDocument();
        expect(screen.getByText('房主')).toBeInTheDocument();
        expect(screen.getByRole('img', { name: '玩家一 頭像' })).toHaveAttribute('src', '/p1.png');
    });

    test('confirms before returning to lobby', () => {
        const props = renderPanel();

        fireEvent.click(screen.getByRole('button', { name: '離開遊戲' }));

        expect(window.confirm).toHaveBeenCalledWith('確定要離開遊戲嗎？');
        expect(props.onReturnToLobby).toHaveBeenCalledTimes(1);
    });

    test('does not leave when confirmation is cancelled', () => {
        (window.confirm as jest.Mock).mockReturnValue(false);
        const props = renderPanel();

        fireEvent.click(screen.getByRole('button', { name: '離開遊戲' }));

        expect(props.onReturnToLobby).not.toHaveBeenCalled();
    });

    test('expands local secret replay without showing opponent hidden cards', () => {
        renderPanel();

        fireEvent.click(screen.getAllByRole('button', { name: '密約（已使用）' })[0]);

        expect(screen.getByText('密約回看')).toBeInTheDocument();
        expect(document.querySelector('.game-info-replay .item-card--mini')).toBeInTheDocument();
        expect(document.body.innerHTML).not.toContain('opponent-secret-card');
    });

    test('opponent replay buttons remain disabled', () => {
        renderPanel();
        const secretButtons = screen.getAllByRole('button', { name: '密約（已使用）' });

        expect(secretButtons[1]).toBeDisabled();
    });
});
