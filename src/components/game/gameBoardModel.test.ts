import { GameState, Geisha, ItemCard } from '@newhandarky/hanakoji-game-types';
import {
    buildCharmLookup,
    buildGeishaItemIconMap,
    buildPlayedCardCountMap,
    buildPlayerBoardContext,
    partitionBoardMotionCues,
    sortGeishasForBoard
} from './gameBoardModel';
import { MotionCue } from './gameMotion';

const makeCard = (id: string, geishaId: number): ItemCard => ({
    id,
    geishaId,
    type: 'sake_01'
} as ItemCard);

const makeGeisha = (id: number, charmPoints: number, boardSlotId?: number): Geisha => ({
    id,
    name: `藝妓 ${id}`,
    charmPoints,
    imageUrl: '',
    controlledBy: null,
    ...(boardSlotId ? { boardSlotId } : {})
} as Geisha);

const makeState = (): GameState => ({
    id: 'game-1',
    players: [
        {
            id: 'p1',
            name: 'Player 1',
            hand: [],
            playedCards: [makeCard('p1-card-1', 2), makeCard('p1-card-2', 2)],
            secretCards: [],
            discardedCards: [],
            actionTokens: [],
            score: { charm: 0, tokens: 0 }
        },
        {
            id: 'p2',
            name: 'Player 2',
            hand: [],
            playedCards: [makeCard('p2-card-1', 3)],
            secretCards: [],
            discardedCards: [],
            actionTokens: [],
            score: { charm: 0, tokens: 0 }
        }
    ],
    geishas: [],
    currentPlayer: 0,
    round: 1,
    phase: 'playing',
    deck: [],
    discardedCards: [],
    removedCard: null,
    pendingInteraction: null,
    geishaSet: 'default'
} as unknown as GameState);

const makeMotionCue = (overrides: Partial<MotionCue>): MotionCue => ({
    id: overrides.id ?? 'cue-1',
    kind: overrides.kind ?? 'placement',
    owner: overrides.owner ?? 'self',
    sourceZone: overrides.sourceZone ?? 'hand',
    targetZone: overrides.targetZone ?? 'board',
    targetGeishaId: overrides.targetGeishaId,
    createdAt: 0,
    durationMs: 100,
    delayMs: 0,
    reducedMotion: false,
    ...overrides
});

describe('gameBoardModel', () => {
    test('builds player context without mutating state', () => {
        const state = makeState();
        const before = JSON.stringify(state);

        const context = buildPlayerBoardContext(state, 'p1', true, false);

        expect(context.currentPlayer?.id).toBe('p1');
        expect(context.myState?.id).toBe('p1');
        expect(context.opponentState?.id).toBe('p2');
        expect(context.isMyTurn).toBe(true);
        expect(context.isOpeningHandInteractionBlocked).toBe(false);
        expect(JSON.stringify(state)).toBe(before);
    });

    test('counts played cards by geisha id', () => {
        const map = buildPlayedCardCountMap([
            makeCard('a', 2),
            makeCard('b', 2),
            makeCard('c', 5)
        ]);

        expect(map.get(2)).toBe(2);
        expect(map.get(5)).toBe(1);
        expect(map.get(1)).toBeUndefined();
    });

    test('sorts geishas by charm points then board slot id', () => {
        const source = [
            makeGeisha(5, 4),
            makeGeisha(2, 2, 3),
            makeGeisha(1, 2, 1),
            makeGeisha(3, 3)
        ];

        const sorted = sortGeishasForBoard(source);

        expect(sorted.map((geisha) => geisha.id)).toEqual([1, 2, 3, 5]);
        expect(source.map((geisha) => geisha.id)).toEqual([5, 2, 1, 3]);
    });

    test('builds item icons from board slot position and charm lookup', () => {
        const geishas = [makeGeisha(10, 5, 2), makeGeisha(11, 3)];
        const iconMap = buildGeishaItemIconMap(geishas, 'default');
        const getCharmByGeishaId = buildCharmLookup(geishas);

        expect(iconMap.get(10)?.key).toBe('default:sake_02');
        expect(iconMap.get(11)?.key).toBe('default:sake_02');
        expect(getCharmByGeishaId(10)).toBe(5);
        expect(getCharmByGeishaId(999)).toBe(0);
    });

    test('partitions board and hand motion cues', () => {
        const boardCue = makeMotionCue({ id: 'board', targetZone: 'board', targetGeishaId: 1 });
        const invalidBoardCue = makeMotionCue({ id: 'invalid-board', targetZone: 'board', targetGeishaId: undefined });
        const handCue = makeMotionCue({ id: 'hand', kind: 'draw', targetZone: 'hand' });
        const competitionCue = makeMotionCue({ id: 'competition', kind: 'competition-result', targetZone: 'board', targetGeishaId: 3 });

        const result = partitionBoardMotionCues([boardCue, invalidBoardCue, handCue, competitionCue]);

        expect(result.boardMotionCues.map((cue) => cue.id)).toEqual(['board', 'competition']);
        expect(result.handMotionCues.map((cue) => cue.id)).toEqual(['hand']);
        expect(result.competitionResultMotionActive).toBe(true);
    });
});
