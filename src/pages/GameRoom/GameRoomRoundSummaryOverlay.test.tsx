import { render, screen } from '@testing-library/react';
import type { Player } from '@newhandarky/hanakoji-game-types';
import { GameRoomRoundSummaryOverlay } from './GameRoomRoundSummaryOverlay';

const players: Player[] = [
    {
        id: 'p1',
        name: '玩家一',
        hand: [],
        playedCards: [],
        secretCards: [],
        discardedCards: [],
        actionTokens: [],
        score: { charm: 3, tokens: 1 }
    },
    {
        id: 'p2',
        name: '玩家二',
        hand: [],
        playedCards: [],
        secretCards: [],
        discardedCards: [],
        actionTokens: [],
        score: { charm: 2, tokens: 2 }
    }
];

describe('GameRoomRoundSummaryOverlay', () => {
    test('shows round number and both player scores', () => {
        render(
            <GameRoomRoundSummaryOverlay
                roundSummary={{ round: 2 }}
                players={players}
                getPlayerDisplayName={(playerId) => players.find((player) => player.id === playerId)?.name ?? '未知玩家'}
            />
        );

        expect(screen.getByText('第 2 回合結算完成')).toBeInTheDocument();
        expect(screen.getByText('玩家一')).toBeInTheDocument();
        expect(screen.getByText('魅力 3')).toBeInTheDocument();
        expect(screen.getByText('藝妓 2')).toBeInTheDocument();
    });
});
