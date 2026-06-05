import { buildMotionSnapshot, deriveMotionCues, MotionSnapshot } from './gameMotionSnapshot';

const makeCard = (id: string, geishaId = 1) => ({
    id,
    geishaId,
    type: 'item' as const
});

const makePlayer = (id: string, handIds: string[], playedIds: string[] = []) => ({
    id,
    name: id,
    avatarUrl: '',
    hand: handIds.map((cardId, index) => makeCard(cardId, index + 1)),
    playedCards: playedIds.map((cardId, index) => makeCard(cardId, index + 1)),
    secretCards: [],
    discardedCards: [],
    actionTokens: [],
    score: { charm: 0, tokens: 0 }
});

describe('gameMotionSnapshot', () => {
    test('builds viewer-relative hand counts and played card maps', () => {
        const snapshot = buildMotionSnapshot({
            players: [
                makePlayer('self', ['self-card-1', 'self-card-2'], ['self-played-1']),
                makePlayer('opponent', ['opponent-card-1'], ['opponent-played-1'])
            ],
            pendingInteraction: null
        } as any, 'self');

        expect(snapshot).toMatchObject({
            currentPlayerId: 'self',
            myHandCardIds: ['self-card-1', 'self-card-2'],
            myHandCount: 2,
            opponentHandCount: 1,
            myPlayedByGeisha: { 1: ['self-played-1'] },
            opponentPlayedByGeisha: { 1: ['opponent-played-1'] }
        });
    });

    test('derives gift result cues from resolved pending interaction without leaking removed card identity', () => {
        const previous: MotionSnapshot = {
            currentPlayerId: 'self',
            myHandCardIds: ['self-card-1'],
            myHandCount: 1,
            opponentHandCount: 1,
            myPlayedByGeisha: {},
            opponentPlayedByGeisha: {},
            pendingInteraction: { type: 'GIFT_SELECTION' } as any
        };
        const current: MotionSnapshot = {
            ...previous,
            myHandCount: 0,
            myPlayedByGeisha: { 2: ['placed-card'] }
        };

        const cues = deriveMotionCues(previous, current, true);

        expect(cues).toEqual(expect.arrayContaining([
            expect.objectContaining({ kind: 'gift-result', owner: 'self', cardId: 'placed-card', geishaId: 2 })
        ]));
        const removalCue = cues.find((cue) => cue.kind === 'removal');
        expect(removalCue).toMatchObject({ kind: 'removal', owner: 'self' });
        expect(removalCue).not.toHaveProperty('cardId');
    });
});
