import React, { act } from 'react';
import { render, screen } from '@testing-library/react';
import GameRoom from './index';

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
    roundSummary: null;
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
const mockState = {
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

jest.mock('../../components/game/GameBoard', () => (props: any) => (
    <div
        data-testid="game-board"
        data-geisha-set={props.state.geishaSet}
        data-can-act={String(props.canAct)}
        data-highlight-active={String(Boolean(props.highlightActive))}
    >
        角色內容
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

describe('GameRoom character set room surface', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        localStorage.setItem('currentPlayerId', 'p1');
        mockState.geishaSet = 'hololive';
        mockHookState.isConnected = true;
        mockHookState.error = null;
        mockHookState.dealQueue = [];
        mockHookState.drawQueue = [];
        mockNavigate.mockReset();
        mockSendGameAction.mockReset();
        mockHookState.consumeDealEvent.mockReset();
        mockHookState.consumeDrawEvent.mockReset();
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

    test('joiner sees the same room geishaSet identity through game-state room content', () => {
        localStorage.setItem('currentPlayerId', 'p2');

        render(<GameRoom />);

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

    test('draw cue stays local to the receiving player and clears quickly', () => {
        mockHookState.drawQueue = [{
            playerId: 'p1',
            card: { id: 'card-99', geishaId: 2, type: 'real' }
        }];

        render(<GameRoom />);

        expect(screen.getByTestId('game-board')).toHaveAttribute('data-highlight-active', 'true');

        act(() => {
            jest.advanceTimersByTime(500);
        });

        expect(mockHookState.consumeDrawEvent).toHaveBeenCalled();
    });

    test('non-holder only sees a brief draw status text without full hand-entry cue', () => {
        mockHookState.drawQueue = [{
            playerId: 'p2',
            card: { id: 'hidden-p2-1', geishaId: 0, type: 'hidden' }
        }];

        render(<GameRoom />);

        expect(screen.getByText('玩家二 抽到了新卡')).toBeInTheDocument();
        expect(screen.queryByText('你抽到一張新牌')).not.toBeInTheDocument();
    });
});
