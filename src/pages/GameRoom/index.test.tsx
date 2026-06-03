import React, { act } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { OpeningDealSummary } from '@newhandarky/hanakoji-game-types';
import GameRoom from './index';
import { shareRoomInvite } from '../../utils/lineLiff';
import { frontendLogger } from '../../utils/runtimeLogger';

const mockNavigate = jest.fn();
const mockSendGameAction = jest.fn();
type MockDrawEvent = {
    playerId: string;
    card: { id: string; geishaId: number; type: string };
};

type MockDealEvent = {
    sequence: Array<{ order: number; playerId: string; card: { id: string; geishaId: number; type: string } }>;
};

const mockHookState: {
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
const mockState: any = {
    phase: 'playing',
    geishaSet: 'hololive',
    currentPlayer: 0,
    winner: null,
    geishas: [],
    pendingInteraction: null,
    players: [
        {
            id: 'p1',
            name: '玩家一',
            avatarUrl: '',
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
            avatarUrl: '',
            hand: [],
            playedCards: [],
            secretCards: [],
            discardedCards: [],
            actionTokens: [],
            score: { charm: 0, tokens: 0 }
        }
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

const mockShareRoomInvite = shareRoomInvite as jest.MockedFunction<typeof shareRoomInvite>;
const mockFrontendLogger = frontendLogger as jest.Mocked<typeof frontendLogger>;
const { usePrefersReducedMotion } = jest.requireMock('../../components/game/gameMotion') as {
    usePrefersReducedMotion: jest.Mock;
};

const makeOpeningDeal = (overrides: Partial<OpeningDealSummary> = {}): OpeningDealSummary => ({
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

const makeOpeningHand = () => Array.from({ length: 6 }, (_, index) => ({
    id: `own-opening-card-${index + 1}`,
    geishaId: index + 1,
    type: 'item',
    itemLabel: `秘密手牌 ${index + 1}`,
    itemImageUrl: `/secret-hand-${index + 1}.png`
}));

const makeActionTokens = (usedType?: string) => [
    { type: 'secret', used: usedType === 'secret' },
    { type: 'trade-off', used: usedType === 'trade-off' },
    { type: 'gift', used: usedType === 'gift' },
    { type: 'competition', used: usedType === 'competition' }
];

const testUser = {
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

describe('GameRoom character set room surface', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        localStorage.setItem('currentPlayerId', 'p1');
        mockState.phase = 'playing';
        mockState.currentPlayer = 0;
        mockState.players = [
            {
                id: 'p1',
                name: '玩家一',
                avatarUrl: '',
                hand: [],
                playedCards: [],
                secretCards: [],
            discardedCards: [],
            actionTokens: makeActionTokens(),
                score: { charm: 0, tokens: 0 }
            },
            {
                id: 'p2',
                name: '玩家二',
                avatarUrl: '',
                hand: [],
                playedCards: [],
                secretCards: [],
            discardedCards: [],
            actionTokens: makeActionTokens(),
                score: { charm: 0, tokens: 0 }
            }
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
    });

    afterEach(() => {
        act(() => {
            jest.runOnlyPendingTimers();
        });
        jest.useRealTimers();
        localStorage.clear();
    });

    test('uses game-state room content without adding extra character-set labels or selectors', () => {
        render(<GameRoom />);

        expect(screen.getByTestId('game-board')).toHaveAttribute('data-geisha-set', 'hololive');
        expect(screen.queryByRole('combobox', { name: '藝妓組合' })).not.toBeInTheDocument();
        expect(screen.queryByText('Ginza')).not.toBeInTheDocument();
        expect(screen.queryByText('Hololive')).not.toBeInTheDocument();
        expect(screen.queryByText('擅自合作系列')).not.toBeInTheDocument();
    });

    test('returns to lobby with room id when a reconnect error blocks entry', () => {
        mockHookState.error = '這個房間的重連憑證已失效，請返回大廳重新加入或更換名稱。';

        render(<GameRoom />);

        fireEvent.click(screen.getByRole('button', { name: '返回大廳' }));

        expect(mockHookState.leaveRoom).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith('/?roomId=ROOM01');
    });

    test('joiner sees the same room geishaSet identity through game-state room content', () => {
        localStorage.setItem('currentPlayerId', 'p2');

        const { unmount } = render(<GameRoom />);

        expect(screen.getByTestId('game-board')).toHaveAttribute('data-geisha-set', 'hololive');
        expect(screen.queryByRole('combobox', { name: '藝妓組合' })).not.toBeInTheDocument();
        expect(screen.queryByText('Hololive')).not.toBeInTheDocument();
    });

    test('restore failure shows a simple recovery message and returns to lobby', () => {
        mockHookState.error = '房間資料無效，請重新建立對戰。';

        render(<GameRoom />);

        expect(screen.getByText('無法進入對戰')).toBeInTheDocument();
        expect(screen.getByText('房間資料無效，請重新建立對戰。')).toBeInTheDocument();
        expect(screen.queryByText(/snapshot|schema|geishaSet/i)).not.toBeInTheDocument();
    });

    test('locks interaction until opening deal primary cue completes', () => {
        mockHookState.dealQueue = [{
            sequence: [
                { order: 0, playerId: 'p1', card: { id: 'card-1', geishaId: 1, type: 'real' } },
                { order: 1, playerId: 'p2', card: { id: 'hidden-p2-1', geishaId: 0, type: 'hidden' } }
            ]
        }];

        render(<GameRoom />);

        expect(screen.getByTestId('game-board')).toHaveAttribute('data-can-act', 'false');

        act(() => {
            jest.advanceTimersByTime(1200);
        });

        expect(mockHookState.consumeDealEvent).toHaveBeenCalled();
    });

    test('opens opening deal modal from replayable safe opening deal summary', () => {
        (mockState as typeof mockState & { openingDeal?: OpeningDealSummary }).openingDeal = makeOpeningDeal();

        render(<GameRoom />);

        expect(screen.getByRole('dialog', { name: '開局發牌' })).toBeInTheDocument();
        expect(screen.getByLabelText('中央牌堆')).toBeInTheDocument();
        expect(screen.getByLabelText('隱藏保留牌')).toBeInTheDocument();
        expect(screen.getByText('先手方向 玩家一（你）')).toBeInTheDocument();
        expect(screen.getByText('後手方向 玩家二（對手）')).toBeInTheDocument();
        expect(screen.getByText('先手 6')).toBeInTheDocument();
        expect(screen.getByText('後手 6')).toBeInTheDocument();
    });

    test('opening deal modal blocks behind-game actions while visible', () => {
        (mockState as typeof mockState & { openingDeal?: OpeningDealSummary }).openingDeal = makeOpeningDeal();

        render(<GameRoom />);

        expect(screen.getByRole('dialog', { name: '開局發牌' })).toBeInTheDocument();
        expect(screen.getByTestId('game-board')).toHaveAttribute('data-can-act', 'false');
    });

    test('opening deal modal makes behind-game surface inert and owns keyboard focus', () => {
        const { rerender } = render(<GameRoom />);
        const infoTab = screen.getByRole('button', { name: '資訊' });
        const gameSurface = screen.getByTestId('game-board').parentElement;

        infoTab.focus();
        expect(document.activeElement).toBe(infoTab);

        (mockState as typeof mockState & { openingDeal?: OpeningDealSummary }).openingDeal = makeOpeningDeal();
        rerender(<GameRoom />);

        const dialog = screen.getByRole('dialog', { name: '開局發牌' });
        expect(dialog).toHaveFocus();
        expect(gameSurface).toHaveAttribute('inert');
        expect(gameSurface).toHaveAttribute('aria-hidden', 'true');

        fireEvent.keyDown(dialog, { key: 'Enter' });

        expect(infoTab).toHaveAttribute('aria-pressed', 'false');
    });

    test('opening deal modal auto-closes within six seconds without changing existing own-hand visibility', () => {
        (mockState.players[0] as any).hand = [
            { id: 'my-card-1', geishaId: 1, type: 'real' } as any
        ];
        (mockState as typeof mockState & { openingDeal?: OpeningDealSummary }).openingDeal = makeOpeningDeal();

        render(<GameRoom />);

        expect(screen.getByRole('dialog', { name: '開局發牌' })).toBeInTheDocument();

        act(() => {
            jest.advanceTimersByTime(6000);
        });

        expect(screen.queryByRole('dialog', { name: '開局發牌' })).not.toBeInTheDocument();
        expect(screen.getByTestId('game-board')).toHaveAttribute('data-can-act', 'true');
    });

    test('opening deal modal output does not expose forbidden card identity fields', () => {
        const openingDeal = makeOpeningDeal() as OpeningDealSummary & { removedCard?: unknown };
        openingDeal.removedCard = { id: 'removed-secret-card', geishaId: 7, itemImageUrl: '/secret.png' };
        (mockState as typeof mockState & { openingDeal?: OpeningDealSummary }).openingDeal = openingDeal;

        render(<GameRoom />);

        expect(screen.queryByText('opening-room-1-round-1')).not.toBeInTheDocument();
        expect(document.body.textContent).not.toContain('removed-secret-card');
        expect(document.body.textContent).not.toContain('geishaId');
        expect(document.body.textContent).not.toContain('itemImageUrl');
    });

    test('reduced motion opening deal modal completes through short path', () => {
        usePrefersReducedMotion.mockReturnValue(true);
        (mockState as typeof mockState & { openingDeal?: OpeningDealSummary }).openingDeal = makeOpeningDeal();

        render(<GameRoom />);

        expect(screen.getByRole('dialog', { name: '開局發牌' })).toBeInTheDocument();

        act(() => {
            jest.advanceTimersByTime(2000);
        });

        expect(screen.queryByRole('dialog', { name: '開局發牌' })).not.toBeInTheDocument();
    });

    test('replayable reconnect restarts opening deal modal from the beginning', () => {
        (mockState as typeof mockState & { openingDeal?: OpeningDealSummary }).openingDeal = makeOpeningDeal();

        const { unmount } = render(<GameRoom />);
        expect(screen.getByRole('dialog', { name: '開局發牌' })).toBeInTheDocument();
        unmount();

        render(<GameRoom />);

        expect(screen.getByRole('dialog', { name: '開局發牌' })).toBeInTheDocument();
    });

    test('not replayable opening deal skips full modal replay', () => {
        (mockState as typeof mockState & { openingDeal?: OpeningDealSummary }).openingDeal = makeOpeningDeal({
            status: 'not_replayable',
            replayable: false
        });

        render(<GameRoom />);

        expect(screen.queryByRole('dialog', { name: '開局發牌' })).not.toBeInTheDocument();
        expect(screen.getByTestId('game-board')).toHaveAttribute('data-can-act', 'true');

        delete (mockState as typeof mockState & { openingDeal?: OpeningDealSummary }).openingDeal;
    });

    test('eligible opening hand shows take control before own hand faces', () => {
        (mockState.players[0] as any).hand = makeOpeningHand();
        (mockState as typeof mockState & { openingDeal?: OpeningDealSummary }).openingDeal = makeOpeningDeal();

        render(<GameRoom />);

        act(() => {
            jest.advanceTimersByTime(6000);
        });

        expect(screen.getByRole('button', { name: '拿取手牌' })).toBeInTheDocument();
        expect(screen.getByTestId('game-board')).toHaveAttribute('data-opening-hand-status', 'pending_take');
        expect(screen.getByTestId('game-board')).toHaveAttribute('data-opening-hand-concealed', 'true');
        expect(screen.queryByText('own-opening-card-1')).not.toBeInTheDocument();
        expect(screen.queryByText('秘密手牌 1')).not.toBeInTheDocument();
        expect(document.body.textContent).not.toContain('/secret-hand-1.png');
    });

    test('eligible opening hand focuses hand actions even when it is not the viewer turn', () => {
        mockState.currentPlayer = 1;
        (mockState.players[0] as any).hand = makeOpeningHand();
        (mockState as typeof mockState & { openingDeal?: OpeningDealSummary }).openingDeal = makeOpeningDeal();

        render(<GameRoom />);

        act(() => {
            jest.advanceTimersByTime(6000);
        });

        expect(screen.getByTestId('game-board')).toHaveAttribute('data-opening-hand-status', 'pending_take');
        expect(screen.getByTestId('game-board')).toHaveAttribute('data-focus-section', 'handActions');
        expect(screen.getByRole('button', { name: '拿取手牌' })).toBeInTheDocument();
    });

    test('taking opening hand reveals own hand in current order and focuses hand actions', async () => {
        (mockState.players[0] as any).hand = makeOpeningHand();
        (mockState as typeof mockState & { openingDeal?: OpeningDealSummary }).openingDeal = makeOpeningDeal();

        const { unmount } = render(<GameRoom />);
        act(() => {
            jest.advanceTimersByTime(6000);
        });

        await testUser.click(screen.getByRole('button', { name: '拿取手牌' }));

        act(() => {
            jest.advanceTimersByTime(3000);
        });

        expect(screen.getByTestId('game-board')).toHaveAttribute('data-opening-hand-status', 'revealed');
        expect(screen.getByTestId('game-board')).toHaveAttribute('data-focus-section', 'handActions');
        expect(screen.getByTestId('mock-visible-own-hand')).toHaveTextContent(
            'own-opening-card-1,own-opening-card-2,own-opening-card-3,own-opening-card-4,own-opening-card-5,own-opening-card-6'
        );
    });

    test('take opening hand supports keyboard activation with Enter and Space', async () => {
        (mockState.players[0] as any).hand = makeOpeningHand();
        (mockState as typeof mockState & { openingDeal?: OpeningDealSummary }).openingDeal = makeOpeningDeal();

        const { unmount } = render(<GameRoom />);
        act(() => {
            jest.advanceTimersByTime(6000);
        });

        const takeButton = screen.getByRole('button', { name: '拿取手牌' });
        takeButton.focus();
        await testUser.keyboard('{Enter}');

        expect(screen.getByTestId('game-board')).toHaveAttribute('data-opening-hand-status', 'revealing');

        act(() => {
            jest.advanceTimersByTime(3000);
        });
        unmount();

        (mockState as typeof mockState & { openingDeal?: OpeningDealSummary }).openingDeal = makeOpeningDeal({
            sequenceId: 'opening-room-1-round-2'
        });
        render(<GameRoom />);
        act(() => {
            jest.advanceTimersByTime(6000);
        });

        const secondTakeButton = screen.getByRole('button', { name: '拿取手牌' });
        secondTakeButton.focus();
        await testUser.keyboard(' ');

        expect(screen.getByTestId('game-board')).toHaveAttribute('data-opening-hand-status', 'revealing');
    });

    test('opening hand flow blocks gameplay actions while preserving section navigation', async () => {
        (mockState.players[0] as any).hand = makeOpeningHand();
        (mockState as typeof mockState & { openingDeal?: OpeningDealSummary }).openingDeal = makeOpeningDeal();

        render(<GameRoom />);
        act(() => {
            jest.advanceTimersByTime(6000);
        });

        expect(screen.getByTestId('game-board')).toHaveAttribute('data-can-act', 'false');
        expect(screen.getByTestId('game-board')).toHaveAttribute('data-opening-hand-blocked', 'true');

        await testUser.click(screen.getByRole('button', { name: '資訊' }));

        expect(screen.getByRole('button', { name: '資訊' })).toHaveAttribute('aria-pressed', 'true');

        await testUser.click(screen.getByRole('button', { name: '拿取手牌' }));

        expect(screen.getByTestId('game-board')).toHaveAttribute('data-can-act', 'false');
        expect(screen.getByTestId('game-board')).toHaveAttribute('data-opening-hand-status', 'revealing');
        expect(mockSendGameAction).not.toHaveBeenCalled();
    });

    test('opening hand hidden-info regression covers opponent removed draw and pending fixtures', () => {
        (mockState.players[0] as any).hand = makeOpeningHand();
        (mockState.players[1] as any).hand = [{ id: 'opponent-secret-card', type: 'hidden', geishaId: 0 }];
        (mockState as any).removedCard = { id: 'removed-hidden-card', geishaId: 7, itemLabel: '移除秘密牌' };
        (mockState as any).drawPile = [{ id: 'draw-pile-secret-card', geishaId: 3, itemLabel: '牌堆秘密牌' }];
        (mockState as typeof mockState & { openingDeal?: OpeningDealSummary }).openingDeal = makeOpeningDeal();

        render(<GameRoom />);
        act(() => {
            jest.advanceTimersByTime(6000);
        });

        expect(document.body.textContent).not.toContain('opponent-secret-card');
        expect(document.body.textContent).not.toContain('removed-hidden-card');
        expect(document.body.textContent).not.toContain('移除秘密牌');
        expect(document.body.textContent).not.toContain('draw-pile-secret-card');
        expect(document.body.textContent).not.toContain('牌堆秘密牌');
    });

    test('reduced motion take flow reveals immediately and lands on hand actions', async () => {
        usePrefersReducedMotion.mockReturnValue(true);
        (mockState.players[0] as any).hand = makeOpeningHand();
        (mockState as typeof mockState & { openingDeal?: OpeningDealSummary }).openingDeal = makeOpeningDeal();

        render(<GameRoom />);
        act(() => {
            jest.advanceTimersByTime(2000);
        });

        await testUser.click(screen.getByRole('button', { name: '拿取手牌' }));

        expect(screen.getByTestId('game-board')).toHaveAttribute('data-opening-hand-status', 'revealed');
        expect(screen.getByTestId('game-board')).toHaveAttribute('data-focus-section', 'handActions');
    });

    test('local opening hand gate can re-present after remount while eligible', () => {
        (mockState.players[0] as any).hand = makeOpeningHand();
        (mockState as typeof mockState & { openingDeal?: OpeningDealSummary }).openingDeal = makeOpeningDeal();

        const { unmount } = render(<GameRoom />);
        act(() => {
            jest.advanceTimersByTime(6000);
        });
        expect(screen.getByRole('button', { name: '拿取手牌' })).toBeInTheDocument();
        unmount();

        render(<GameRoom />);
        act(() => {
            jest.advanceTimersByTime(6000);
        });

        expect(screen.getByRole('button', { name: '拿取手牌' })).toBeInTheDocument();
        expect(screen.queryByTestId('mock-visible-own-hand')).not.toBeInTheDocument();
    });

    test('opening hand gate remains available when opponent action marks deal replay not replayable', () => {
        (mockState.players[0] as any).hand = makeOpeningHand();
        (mockState.players[1] as any).actionTokens = makeActionTokens('secret');
        (mockState as typeof mockState & { openingDeal?: OpeningDealSummary }).openingDeal = {
            ...makeOpeningDeal(),
            status: 'not_replayable',
            replayable: false
        };

        render(<GameRoom />);
        act(() => {
            jest.advanceTimersByTime(6000);
        });

        expect(screen.getByRole('button', { name: '拿取手牌' })).toBeInTheDocument();
        expect(screen.getByTestId('game-board')).toHaveAttribute('data-opening-hand-status', 'pending_take');
        expect(screen.getByTestId('game-board')).toHaveAttribute('data-opening-hand-blocked', 'true');
    });

    test('progressed or non-starting hand state skips take opening hand gate', () => {
        (mockState.players[0] as any).hand = makeOpeningHand();
        (mockState.players[0] as any).actionTokens = makeActionTokens('secret');
        (mockState as typeof mockState & { openingDeal?: OpeningDealSummary }).openingDeal = makeOpeningDeal();

        const { rerender } = render(<GameRoom />);
        act(() => {
            jest.advanceTimersByTime(6000);
        });

        expect(screen.queryByRole('button', { name: '拿取手牌' })).not.toBeInTheDocument();

        (mockState.players[0] as any).actionTokens = makeActionTokens();
        (mockState.players[0] as any).hand = makeOpeningHand().slice(0, 5);
        rerender(<GameRoom />);

        expect(screen.queryByRole('button', { name: '拿取手牌' })).not.toBeInTheDocument();
    });

    test('self draw on character board keeps focus and shows safe notification', () => {
        mockHookState.drawQueue = [{
            playerId: 'p1',
            card: { id: 'card-99', geishaId: 2, type: 'real' }
        }];

        render(<GameRoom />);

        expect(screen.getByTestId('game-board')).toHaveAttribute('data-focus-section', 'characterBoard');
        expect(screen.getByRole('status', { name: '抽牌通知' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: '稍後確認' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: '現在查看' })).toBeInTheDocument();
        expect(document.body.textContent).not.toContain('card-99');
        expect(document.body.textContent).not.toContain('geishaId');
        expect(mockHookState.consumeDrawEvent).not.toHaveBeenCalled();

        act(() => {
            jest.advanceTimersByTime(5000);
        });

        expect(mockHookState.consumeDrawEvent).toHaveBeenCalled();
        expect(screen.getByTestId('game-board')).toHaveAttribute('data-focus-section', 'characterBoard');
    });

    test('self draw on info section keeps info focused without expanding hand actions', () => {
        mockHookState.drawQueue = [{
            playerId: 'p1',
            card: { id: 'card-info-1', geishaId: 2, type: 'real' }
        }];

        render(<GameRoom />);
        fireEvent.click(screen.getByRole('button', { name: '資訊' }));

        expect(screen.getByTestId('game-board')).toHaveAttribute('data-focus-section', 'info');
        expect(screen.getByRole('status', { name: '抽牌通知' })).toBeInTheDocument();
        expect(screen.getByTestId('game-board')).toHaveAttribute('data-highlight-active', 'false');
    });

    test('self draw notification keyboard actions match pointer decisions', () => {
        mockHookState.drawQueue = [{
            playerId: 'p1',
            card: { id: 'card-99', geishaId: 2, type: 'real' }
        }];

        const { unmount } = render(<GameRoom />);

        fireEvent.keyDown(screen.getByRole('button', { name: '稍後確認' }), { key: 'Enter' });
        expect(mockHookState.consumeDrawEvent).toHaveBeenCalledTimes(1);

        unmount();
        mockHookState.consumeDrawEvent.mockReset();
        mockHookState.drawQueue = [{
            playerId: 'p1',
            card: { id: 'card-100', geishaId: 3, type: 'real' }
        }];

        render(<GameRoom />);

        fireEvent.keyDown(screen.getByRole('button', { name: '現在查看' }), { key: ' ' });

        expect(screen.getByTestId('game-board')).toHaveAttribute('data-focus-section', 'handActions');
        expect(screen.getByTestId('game-board')).toHaveAttribute('data-highlight-active', 'true');
        expect(screen.getByTestId('game-board')).toHaveAttribute('data-highlight-card-id', 'card-100');
    });

    test('later confirmation followed by manual hand navigation does not replay the same draw', () => {
        mockHookState.drawQueue = [{
            playerId: 'p1',
            card: { id: 'card-later-1', geishaId: 3, type: 'real' }
        }];

        render(<GameRoom />);

        fireEvent.click(screen.getByRole('button', { name: '稍後確認' }));
        fireEvent.click(screen.getByRole('button', { name: '手牌&指令' }));

        expect(mockHookState.consumeDrawEvent).toHaveBeenCalledTimes(1);
        expect(screen.queryByRole('status', { name: '抽牌通知' })).not.toBeInTheDocument();
        expect(screen.getByTestId('game-board')).toHaveAttribute('data-focus-section', 'handActions');
        expect(screen.getByTestId('game-board')).toHaveAttribute('data-highlight-active', 'false');
    });

    test('non-holder only sees a brief draw status text without full hand-entry cue', () => {
        mockHookState.drawQueue = [{
            playerId: 'p2',
            card: { id: 'hidden-p2-1', geishaId: 0, type: 'hidden' }
        }];

        render(<GameRoom />);

        expect(screen.getByText('玩家二 抽到了新卡')).toBeInTheDocument();
        expect(screen.queryByText('你抽到一張新牌')).not.toBeInTheDocument();
        expect(document.body.textContent).not.toContain('hidden-p2-1');
        expect(document.body.textContent).not.toContain('geishaId');
    });

    test('self draw in handActions skips notification and starts draw presentation', () => {
        mockHookState.drawQueue = [{
            playerId: 'p1',
            card: { id: 'card-101', geishaId: 4, type: 'real' }
        }];

        render(<GameRoom />);
        fireEvent.click(screen.getByRole('button', { name: '手牌&指令' }));

        expect(screen.queryByRole('status', { name: '抽牌通知' })).not.toBeInTheDocument();
        expect(screen.getByTestId('game-board')).toHaveAttribute('data-focus-section', 'handActions');
        expect(screen.getByTestId('game-board')).toHaveAttribute('data-highlight-active', 'true');
        expect(screen.getByTestId('game-board')).toHaveAttribute('data-motion-card-ids', 'card-101');
    });

    test('self draw during order decision defers notification until release and uses release focus', () => {
        mockState.orderDecision = {
            isOpen: true,
            phase: 'choosing',
            players: [],
            result: null,
            confirmations: [],
            waitingFor: ['p1']
        };
        mockHookState.drawQueue = [{
            playerId: 'p1',
            card: { id: 'card-102', geishaId: 5, type: 'real' }
        }];

        const { rerender } = render(<GameRoom />);

        expect(screen.queryByRole('status', { name: '抽牌通知' })).not.toBeInTheDocument();
        expect(mockHookState.consumeDrawEvent).not.toHaveBeenCalled();

        mockState.orderDecision = {
            isOpen: false,
            phase: 'idle',
            players: [],
            result: null,
            confirmations: [],
            waitingFor: []
        };
        rerender(<GameRoom />);

        expect(screen.getByRole('status', { name: '抽牌通知' })).toBeInTheDocument();
        expect(screen.getByTestId('game-board')).toHaveAttribute('data-focus-section', 'characterBoard');
    });

    test('self draw during round summary defers notification until summary closes', () => {
        mockHookState.roundSummary = {
            round: 1,
            players: []
        };
        mockHookState.drawQueue = [{
            playerId: 'p1',
            card: { id: 'card-summary-1', geishaId: 5, type: 'real' }
        }];

        const { rerender } = render(<GameRoom />);

        expect(screen.getByText('第 1 回合結算完成')).toBeInTheDocument();
        expect(screen.queryByRole('status', { name: '抽牌通知' })).not.toBeInTheDocument();
        expect(mockHookState.consumeDrawEvent).not.toHaveBeenCalled();

        mockHookState.roundSummary = null;
        rerender(<GameRoom />);

        expect(screen.getByRole('status', { name: '抽牌通知' })).toBeInTheDocument();
        expect(mockHookState.consumeDrawEvent).not.toHaveBeenCalled();
    });

    test('multiple self draw events process in arrival order after each decision', () => {
        const firstDraw = {
            playerId: 'p1',
            card: { id: 'card-queue-1', geishaId: 1, type: 'real' }
        };
        const secondDraw = {
            playerId: 'p1',
            card: { id: 'card-queue-2', geishaId: 2, type: 'real' }
        };
        mockHookState.drawQueue = [firstDraw, secondDraw];

        const { rerender } = render(<GameRoom />);

        expect(screen.getByRole('status', { name: '抽牌通知' })).toBeInTheDocument();
        expect(document.body.textContent).not.toContain('card-queue-1');

        fireEvent.click(screen.getByRole('button', { name: '稍後確認' }));
        expect(mockHookState.consumeDrawEvent).toHaveBeenCalledTimes(1);

        mockHookState.drawQueue = [secondDraw];
        rerender(<GameRoom />);

        expect(screen.getByRole('status', { name: '抽牌通知' })).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: '現在查看' }));

        expect(screen.getByTestId('game-board')).toHaveAttribute('data-highlight-card-id', 'card-queue-2');
    });

    test('active gameplay does not show waiting-room invite controls', () => {
        render(<GameRoom />);

        expect(screen.queryByRole('button', { name: 'LINE 邀請好友' })).not.toBeInTheDocument();
    });

    test('waiting room shows sent invite feedback without blocking room actions', async () => {
        mockState.phase = 'waiting';
        mockState.players = [mockState.players[0]];
        mockShareRoomInvite.mockResolvedValue({ mode: 'share', url: 'https://liff.line.me/test?roomId=ROOM01' });

        render(<GameRoom />);
        await testUser.click(screen.getByRole('button', { name: 'LINE 邀請好友' }));

        expect(await screen.findByText('LINE 邀請已送出。')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: '複製' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: '返回大廳' })).toBeInTheDocument();
    });

    test('waiting room shows copied invite feedback', async () => {
        mockState.phase = 'waiting';
        mockState.players = [mockState.players[0]];
        mockShareRoomInvite.mockResolvedValue({ mode: 'copy', url: 'https://example.test/?roomId=ROOM01' });

        render(<GameRoom />);
        await testUser.click(screen.getByRole('button', { name: 'LINE 邀請好友' }));

        expect(await screen.findByText('已複製邀請連結，請貼給好友。')).toBeInTheDocument();
        expect(screen.getByText('https://example.test/?roomId=ROOM01')).toBeInTheDocument();
    });

    test('waiting room shows cancelled invite feedback and keeps retry available', async () => {
        mockState.phase = 'waiting';
        mockState.players = [mockState.players[0]];
        mockShareRoomInvite.mockResolvedValue({ mode: 'cancelled', url: 'https://liff.line.me/test?roomId=ROOM01' });

        render(<GameRoom />);
        await testUser.click(screen.getByRole('button', { name: 'LINE 邀請好友' }));

        expect(await screen.findByText('已取消 LINE 好友選擇，可以重試或改用連結分享。')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'LINE 邀請好友' })).toBeInTheDocument();
    });

    test('waiting room shows manual link when invite copy is unavailable', async () => {
        mockState.phase = 'waiting';
        mockState.players = [mockState.players[0]];
        mockShareRoomInvite.mockResolvedValue({
            mode: 'unavailable',
            url: 'https://example.test/?roomId=ROOM01',
            reason: 'clipboard-unavailable'
        });

        render(<GameRoom />);
        await testUser.click(screen.getByRole('button', { name: 'LINE 邀請好友' }));

        expect(await screen.findByText('目前無法自動複製邀請連結，請手動複製下方連結分享。')).toBeInTheDocument();
        expect(screen.getByText('https://example.test/?roomId=ROOM01')).toBeInTheDocument();
    });

    test('waiting room shows failed invite feedback without raw error details', async () => {
        mockState.phase = 'waiting';
        mockState.players = [mockState.players[0]];
        mockShareRoomInvite.mockResolvedValue({
            mode: 'failed',
            url: 'https://liff.line.me/test?roomId=ROOM01',
            reason: 'share-failed'
        });

        render(<GameRoom />);
        await testUser.click(screen.getByRole('button', { name: 'LINE 邀請好友' }));

        expect(await screen.findByText('LINE 邀請暫時失敗，請改用下方連結分享。')).toBeInTheDocument();
        expect(screen.queryByText('share-failed')).not.toBeInTheDocument();
        expect(mockFrontendLogger.warn).toHaveBeenCalledWith('⚠️ LINE 邀請失敗', {
            roomId: 'ROOM01',
            reason: 'share-failed'
        });
    });
});
