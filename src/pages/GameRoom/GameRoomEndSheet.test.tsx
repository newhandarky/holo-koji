import { fireEvent, render, screen } from '@testing-library/react';
import type { Player } from '@newhandarky/hanakoji-game-types';
import { GameRoomEndSheet } from './GameRoomEndSheet';

const players: Player[] = [
    {
        id: 'p1',
        name: '玩家一',
        hand: [],
        playedCards: [],
        secretCards: [],
        discardedCards: [],
        actionTokens: [],
        score: { charm: 4, tokens: 2 }
    },
    {
        id: 'p2',
        name: '玩家二',
        hand: [],
        playedCards: [],
        secretCards: [],
        discardedCards: [],
        actionTokens: [],
        score: { charm: 1, tokens: 1 }
    }
];

const renderSheet = (overrides: Partial<React.ComponentProps<typeof GameRoomEndSheet>> = {}) => {
    const props: React.ComponentProps<typeof GameRoomEndSheet> = {
        players,
        winner: 'p1',
        isCollapsed: false,
        isRematchRequested: false,
        getPlayerDisplayName: (playerId) => players.find((player) => player.id === playerId)?.name ?? '未知玩家',
        onCollapse: jest.fn(),
        onExpand: jest.fn(),
        onReturnToLobby: jest.fn(),
        onRequestRematch: jest.fn(),
        ...overrides
    };
    render(<GameRoomEndSheet {...props} />);
    return props;
};

describe('GameRoomEndSheet', () => {
    test('shows winner, scores, and dispatches actions', () => {
        const props = renderSheet();

        expect(screen.getByText('🎉 遊戲結束！')).toBeInTheDocument();
        expect(screen.getAllByText('玩家一')).toHaveLength(2);
        expect(screen.getByText('魅力 4 / 藝妓 2')).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: '查看戰況' }));
        fireEvent.click(screen.getByRole('button', { name: '返回大廳' }));
        fireEvent.click(screen.getByRole('button', { name: '再來一場' }));

        expect(props.onCollapse).toHaveBeenCalledTimes(1);
        expect(props.onReturnToLobby).toHaveBeenCalledTimes(1);
        expect(props.onRequestRematch).toHaveBeenCalledTimes(1);
    });

    test('shows collapsed expand button and disables rematch while waiting', () => {
        const collapsedProps = renderSheet({ isCollapsed: true });

        fireEvent.click(screen.getByRole('button', { name: '展開結算' }));

        expect(collapsedProps.onExpand).toHaveBeenCalledTimes(1);

        renderSheet({ isRematchRequested: true });

        expect(screen.getByRole('button', { name: '等待對手...' })).toBeDisabled();
    });
});
