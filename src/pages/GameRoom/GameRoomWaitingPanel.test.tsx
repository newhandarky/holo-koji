import { fireEvent, render, screen } from '@testing-library/react';
import type { GameState } from '@newhandarky/hanakoji-game-types';
import { GameRoomWaitingPanel } from './GameRoomWaitingPanel';

jest.mock('../../utils/lineLiff', () => ({
    isLineClient: jest.fn(() => false)
}));

const makeWaitingState = (players: GameState['players']): GameState => ({
    gameId: 'ROOM01',
    phase: 'waiting',
    round: 1,
    geishaSet: 'hololive',
    currentPlayer: 0,
    winner: undefined,
    geishas: [],
    drawPile: [],
    discardPile: [],
    pendingInteraction: null,
    players,
    orderDecision: {
        isOpen: false,
        phase: 'deciding',
        currentPlayer: '',
        players: [],
        result: undefined,
        confirmations: [],
        waitingFor: []
    }
} as GameState);

const player = {
    id: 'p1',
    name: '玩家一',
    hand: [],
    playedCards: [],
    secretCards: [],
    discardedCards: [],
    actionTokens: [],
    score: { charm: 0, tokens: 0 }
};

const renderPanel = (overrides: Partial<React.ComponentProps<typeof GameRoomWaitingPanel>> = {}) => {
    const props: React.ComponentProps<typeof GameRoomWaitingPanel> = {
        state: makeWaitingState([player]),
        roomId: 'ROOM01',
        displayName: '玩家一',
        displayAvatar: '/avatar.png',
        isMyTurn: false,
        showRoomCode: false,
        inviteOutcome: null,
        getPlayerDisplayName: (playerId) => playerId === 'p1' ? '玩家一' : '未知玩家',
        onToggleRoomCode: jest.fn(),
        onCopyRoomCode: jest.fn(),
        onShareRoomInvite: jest.fn(),
        onOpenLineInvite: jest.fn(),
        onReturnToLobby: jest.fn(),
        ...overrides
    };
    render(<GameRoomWaitingPanel {...props} />);
    return props;
};

describe('GameRoomWaitingPanel', () => {
    test('shows waiting player identity and joined players', () => {
        renderPanel();

        expect(screen.getByText('等待對手加入')).toBeInTheDocument();
        expect(screen.getAllByText('玩家一')).toHaveLength(2);
        expect(screen.getByText('目前玩家: 1/2')).toBeInTheDocument();
        expect(screen.getByRole('img', { name: '玩家一 頭像' })).toHaveAttribute('src', '/avatar.png');
    });

    test('calls room invite and lobby actions', () => {
        const props = renderPanel();

        fireEvent.click(screen.getByRole('button', { name: '顯示' }));
        fireEvent.click(screen.getByRole('button', { name: '複製' }));
        fireEvent.click(screen.getByRole('button', { name: 'LINE 邀請好友' }));
        fireEvent.click(screen.getByRole('button', { name: '用 LINE 開啟' }));
        fireEvent.click(screen.getByRole('button', { name: '返回大廳' }));

        expect(props.onToggleRoomCode).toHaveBeenCalledTimes(1);
        expect(props.onCopyRoomCode).toHaveBeenCalledTimes(1);
        expect(props.onShareRoomInvite).toHaveBeenCalledTimes(1);
        expect(props.onOpenLineInvite).toHaveBeenCalledTimes(1);
        expect(props.onReturnToLobby).toHaveBeenCalledTimes(1);
    });

    test('shows room code and invite feedback', () => {
        renderPanel({
            showRoomCode: true,
            inviteOutcome: { mode: 'copy', url: 'https://example.test/?roomId=ROOM01' }
        });

        expect(screen.getByText('已複製邀請連結，請貼給好友。')).toBeInTheDocument();
        expect(screen.getByText('https://example.test/?roomId=ROOM01')).toBeInTheDocument();
        expect(screen.getByText('ROOM01')).toBeInTheDocument();
    });
});
