import { fireEvent, render, screen } from '@testing-library/react';
import type { GameState } from '@newhandarky/hanakoji-game-types';
import { GameRoomActiveSurface } from './GameRoomActiveSurface';

jest.mock('../../components/game/GameBoard', () => (props: { focusSection: string; canAct: boolean }) => (
    <div data-testid="mock-game-board" data-focus-section={props.focusSection} data-can-act={String(props.canAct)}>
        board
    </div>
));

jest.mock('./GameRoomInfoPanel', () => ({
    GameRoomInfoPanel: () => <div data-testid="mock-info-panel">info</div>
}));

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
    players: [{
        id: 'p1',
        name: '玩家一',
        avatarUrl: '/p1.png',
        hand: [],
        playedCards: [],
        secretCards: [],
        discardedCards: [],
        actionTokens: [],
        score: { charm: 0, tokens: 0 }
    }],
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

const renderSurface = (overrides: Partial<React.ComponentProps<typeof GameRoomActiveSurface>> = {}) => {
    const state = makeState();
    const props: React.ComponentProps<typeof GameRoomActiveSurface> = {
        state,
        gameSurfaceRef: { current: null },
        isInteractionLocked: false,
        isOpeningDealModalActive: false,
        focusSection: 'characterBoard',
        onFocusSectionChange: jest.fn(),
        currentPlayerId: 'p1',
        currentPlayer: state.players[0],
        hostId: 'p1',
        activeTurnPlayerName: '玩家一',
        displayName: '玩家一',
        activeGeishaSet: 'hololive',
        getPlayerDisplayName: () => '玩家一',
        getPlayerAvatar: () => '/p1.png',
        onReturnToLobby: jest.fn(),
        onSendAction: jest.fn(),
        canAct: true,
        highlightCardId: null,
        highlightActive: false,
        motionCues: [],
        prefersReducedMotion: false,
        openingDealSteps: [],
        openingHandReveal: null,
        onTakeOpeningHand: jest.fn(),
        ...overrides
    };

    render(<GameRoomActiveSurface {...props} />);
    return props;
};

describe('GameRoomActiveSurface', () => {
    test('keeps the active room shell classes and passes board focus state', () => {
        renderSurface({ isInteractionLocked: true, isOpeningDealModalActive: true });

        expect(document.querySelector('.game-room-surface')).toHaveClass('game-card--locked');
        expect(document.querySelector('.game-room-surface')).toHaveAttribute('aria-hidden', 'true');
        expect(screen.getByTestId('mock-game-board')).toHaveAttribute('data-focus-section', 'characterBoard');
        expect(screen.getByTestId('mock-game-board')).toHaveAttribute('data-can-act', 'true');
    });

    test('renders info panel only when info section is focused and changes tabs through callback', () => {
        const props = renderSurface({ focusSection: 'info' });

        expect(screen.getByTestId('mock-info-panel')).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: '角色' }));

        expect(props.onFocusSectionChange).toHaveBeenCalledWith('characterBoard');
    });
});
