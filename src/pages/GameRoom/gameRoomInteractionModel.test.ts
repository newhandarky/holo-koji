import { buildGameRoomReplayModel } from './gameRoomInteractionModel';
import type { Player } from '@newhandarky/hanakoji-game-types';

const makePlayer = (): Player => ({
    id: 'p1',
    name: 'p1',
    avatarUrl: '',
    hand: [],
    playedCards: [],
    secretCards: [{ id: 'secret-card', geishaId: 1, type: 'real' }],
    discardedCards: [{ id: 'discarded-card', geishaId: 2, type: 'real' }],
    actionTokens: [
        { type: 'secret', used: true },
        { type: 'trade-off', used: false },
        { type: 'gift', used: false },
        { type: 'competition', used: false }
    ],
    score: { charm: 0, tokens: 0 }
});

describe('gameRoomInteractionModel', () => {
    test('allows replay only for current player used secret or trade-off cards', () => {
        const model = buildGameRoomReplayModel({
            currentPlayer: makePlayer(),
            currentPlayerId: 'p1',
            expandedInfoReplayAction: 'secret'
        });

        expect(model.isReplayEligible('p1', 'secret')).toBe(true);
        expect(model.isReplayEligible('p1', 'trade-off')).toBe(false);
        expect(model.isReplayEligible('p2', 'secret')).toBe(false);
        expect(model.isReplayEligible('p1', 'gift')).toBe(false);
    });

    test('exposes active replay cards for expanded action only', () => {
        expect(buildGameRoomReplayModel({
            currentPlayer: makePlayer(),
            currentPlayerId: 'p1',
            expandedInfoReplayAction: 'secret'
        }).activeReplayCards).toEqual([{ id: 'secret-card', geishaId: 1, type: 'real' }]);

        expect(buildGameRoomReplayModel({
            currentPlayer: makePlayer(),
            currentPlayerId: 'p1',
            expandedInfoReplayAction: null
        }).activeReplayCards).toEqual([]);
    });
});
