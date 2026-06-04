import { act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { OpeningDealSummary } from '@newhandarky/hanakoji-game-types';
import GameRoom from './index';
import { shareRoomInvite } from '../../utils/lineLiff';
import { frontendLogger } from '../../utils/runtimeLogger';

export const mockNavigate = jest.fn();
export const mockSendGameAction = jest.fn();

export type MockDrawEvent = {
    playerId: string;
    card: { id: string; geishaId: number; type: string };
};

export type MockDealEvent = {
    sequence: Array<{ order: number; playerId: string; card: { id: string; geishaId: number; type: string } }>;
};

export const mockHookState: {
    isConnected: boolean;
    error: string | null;
    roundSummary: any | null;
    readyStatus: null;
    confirmOrder: jest.Mock;
    sendGameAction: jest.Mock;
    requestRematch: jest.Mock;
    confirmReady: jest.Mock;
    leaveRoom: jest.Mock;
    dealQueue: MockDealEvent[];
    consumeDealEvent: jest.Mock;
    drawQueue: MockDrawEvent[];
    consumeDrawEvent: jest.Mock;
} = {
    isConnected: true,
    error: null as string | null,
    roundSummary: null,
    readyStatus: null,
    confirmOrder: jest.fn(),
    sendGameAction: mockSendGameAction,
    requestRematch: jest.fn(),
    confirmReady: jest.fn(),
    leaveRoom: jest.fn(),
    dealQueue: [],
    consumeDealEvent: jest.fn(),
    drawQueue: [],
    consumeDrawEvent: jest.fn()
};

export const makeActionTokens = (usedType?: string) => [
    { type: 'secret', used: usedType === 'secret' },
    { type: 'trade-off', used: usedType === 'trade-off' },
    { type: 'gift', used: usedType === 'gift' },
    { type: 'competition', used: usedType === 'competition' }
];

export const makePlayer = (overrides: Record<string, unknown> = {}) => ({
    id: 'p1',
    name: '玩家一',
    avatarUrl: '',
    hand: [],
    playedCards: [],
    secretCards: [],
    discardedCards: [],
    actionTokens: makeActionTokens(),
    score: { charm: 0, tokens: 0 },
    ...overrides
});

export const mockState: any = {
    phase: 'playing',
    geishaSet: 'hololive',
    currentPlayer: 0,
    winner: null,
    geishas: [],
    pendingInteraction: null,
    players: [
        makePlayer(),
        makePlayer({ id: 'p2', name: '玩家二' })
    ],
    orderDecision: {
        isOpen: false,
        phase: 'idle',
        players: [],
        result: null,
        confirmations: [],
        waitingFor: []
    }
};

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
    useParams: () => ({ roomId: 'ROOM01' })
}));

jest.mock('../../contexts/GameContext', () => ({
    useGame: () => ({ state: mockState })
}));

jest.mock('../../hooks/useWebSocket', () => ({
    useWebSocket: () => ({ ...mockHookState })
}));

jest.mock('../../utils/runtimeLogger', () => ({
    frontendLogger: {
        diagnostic: jest.fn(),
        error: jest.fn(),
        info: jest.fn(),
        warn: jest.fn()
    },
    summarizeGameState: jest.fn(() => ({}))
}));

jest.mock('../../components/game/GameBoard', () => (props: any) => (
    <div
        data-testid="game-board"
        data-geisha-set={props.state.geishaSet}
        data-can-act={String(props.canAct)}
        data-highlight-active={String(Boolean(props.highlightActive))}
        data-focus-section={props.focusSection}
        data-opening-hand-status={props.openingHandReveal?.status ?? 'none'}
        data-opening-hand-concealed={String(Boolean(props.openingHandReveal?.isConcealed))}
        data-opening-hand-blocked={String(Boolean(props.openingHandReveal?.isInteractionBlocked))}
        data-opening-hand-revealed-count={String(props.openingHandReveal?.revealedCount ?? 0)}
        data-highlight-card-id={props.highlightCardId ?? ''}
        data-motion-card-ids={(props.motionCues ?? []).map((cue: any) => cue.cardId).filter(Boolean).join(',')}
    >
        角色內容
        {props.openingHandReveal?.status === 'pending_take' && (
            <button type="button" onClick={props.onTakeOpeningHand}>拿取手牌</button>
        )}
        {props.openingHandReveal && !props.openingHandReveal.isConcealed && (
            <div data-testid="mock-visible-own-hand">
                {props.state.players.find((player: any) => player.id === 'p1')?.hand.map((card: any) => card.id).join(',')}
            </div>
        )}
    </div>
));

jest.mock('../../components/game/OrderDecisionModal', () => () => null);
jest.mock('../../components/game/PendingInteractionModal', () => () => null);
jest.mock('../../utils/lineLiff', () => ({
    shareRoomInvite: jest.fn(),
    getLiffInviteUrl: jest.fn(() => ''),
    isLineClient: jest.fn(() => false)
}));
jest.mock('../../components/game/gameMotion', () => {
    const actual = jest.requireActual('../../components/game/gameMotion');

    return {
        ...actual,
        buildMotionSnapshot: jest.fn(() => null),
        deriveMotionCues: jest.fn(() => []),
        usePrefersReducedMotion: jest.fn(() => false)
    };
});

export const mockShareRoomInvite = shareRoomInvite as jest.MockedFunction<typeof shareRoomInvite>;
export const mockFrontendLogger = frontendLogger as jest.Mocked<typeof frontendLogger>;
export const { usePrefersReducedMotion } = jest.requireMock('../../components/game/gameMotion') as {
    usePrefersReducedMotion: jest.Mock;
};

export const makeOpeningDeal = (overrides: Partial<OpeningDealSummary> = {}): OpeningDealSummary => ({
    sequenceId: 'opening-room-1-round-1',
    status: 'completed',
    completed: true,
    replayable: true,
    steps: [
        { type: 'BURN_HIDDEN_CARD', order: 0, targetZone: 'hidden-reserve' },
        ...Array.from({ length: 6 }, (_, index) => ([
            { type: 'DEAL_CARD_BACK' as const, order: index * 2 + 1, targetPlayerId: 'p1', cardIndex: index + 1 },
            { type: 'DEAL_CARD_BACK' as const, order: index * 2 + 2, targetPlayerId: 'p2', cardIndex: index + 1 }
        ])).flat(),
        { type: 'OPENING_DEAL_COMPLETE', order: 13 }
    ],
    ...overrides
});

export const makeOpeningHand = () => Array.from({ length: 6 }, (_, index) => ({
    id: `own-opening-card-${index + 1}`,
    geishaId: index + 1,
    type: 'item',
    itemLabel: `秘密手牌 ${index + 1}`,
    itemImageUrl: `/secret-hand-${index + 1}.png`
}));

export const testUser = {
    click: async (element: Element) => {
        const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
        await act(async () => {
            await user.click(element);
        });
    },
    keyboard: async (text: string) => {
        const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
        await act(async () => {
            await user.keyboard(text);
        });
    }
};

export const resetGameRoomTestHarness = () => {
    jest.useFakeTimers();
    localStorage.setItem('currentPlayerId', 'p1');
    mockState.phase = 'playing';
    mockState.currentPlayer = 0;
    mockState.players = [
        makePlayer(),
        makePlayer({ id: 'p2', name: '玩家二' })
    ];
    mockState.geishaSet = 'hololive';
    mockState.orderDecision = {
        isOpen: false,
        phase: 'idle',
        players: [],
        result: null,
        confirmations: [],
        waitingFor: []
    };
    mockState.pendingInteraction = null;
    mockHookState.isConnected = true;
    mockHookState.error = null;
    mockHookState.roundSummary = null;
    mockHookState.readyStatus = null;
    mockHookState.dealQueue = [];
    mockHookState.drawQueue = [];
    mockNavigate.mockReset();
    mockSendGameAction.mockReset();
    mockShareRoomInvite.mockReset();
    mockFrontendLogger.diagnostic.mockClear();
    mockFrontendLogger.error.mockClear();
    mockFrontendLogger.info.mockClear();
    mockFrontendLogger.warn.mockClear();
    mockHookState.consumeDealEvent.mockReset();
    mockHookState.consumeDrawEvent.mockReset();
    usePrefersReducedMotion.mockReturnValue(false);
    delete (mockState as typeof mockState & { openingDeal?: OpeningDealSummary }).openingDeal;
};

export const GameRoomTestSubject = GameRoom;
