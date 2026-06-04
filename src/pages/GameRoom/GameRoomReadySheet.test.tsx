import { fireEvent, render, screen } from '@testing-library/react';
import type { Player, ReadyStatusPayload } from '@newhandarky/hanakoji-game-types';
import { GameRoomReadySheet } from './GameRoomReadySheet';

const players: Player[] = [
    {
        id: 'p1',
        name: '玩家一',
        hand: [],
        playedCards: [],
        secretCards: [],
        discardedCards: [],
        actionTokens: [],
        score: { charm: 0, tokens: 0 }
    },
    {
        id: 'p2',
        name: '玩家二',
        hand: [],
        playedCards: [],
        secretCards: [],
        discardedCards: [],
        actionTokens: [],
        score: { charm: 0, tokens: 0 }
    }
];

describe('GameRoomReadySheet', () => {
    test('shows ready confirmations and dispatches confirm action', () => {
        const onConfirmReady = jest.fn();
        const readyStatus: ReadyStatusPayload = {
            confirmations: ['p1'],
            waitingFor: ['p2']
        };

        render(
            <GameRoomReadySheet
                readyStatus={readyStatus}
                players={players}
                getPlayerDisplayName={(playerId) => players.find((player) => player.id === playerId)?.name ?? '未知玩家'}
                onConfirmReady={onConfirmReady}
            />
        );

        expect(screen.getByText('✅ 已準備')).toBeInTheDocument();
        expect(screen.getByText('⏳ 等待中')).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: '我準備好了' }));

        expect(onConfirmReady).toHaveBeenCalledTimes(1);
    });
});
