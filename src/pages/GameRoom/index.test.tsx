import React from 'react';
import { render, screen } from '@testing-library/react';
import GameRoom from './index';

const mockNavigate = jest.fn();
const mockSendGameAction = jest.fn();
const mockHookState = {
    isConnected: true,
    error: null as string | null,
    roundSummary: null,
    readyStatus: null,
    confirmOrder: jest.fn(),
    sendGameAction: mockSendGameAction,
    requestRematch: jest.fn(),
    confirmReady: jest.fn(),
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
    <div data-testid="game-board" data-geisha-set={props.state.geishaSet}>
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
jest.mock('../../components/game/gameMotion', () => ({
    buildMotionSnapshot: jest.fn(() => null),
    createDrawMotionCue: jest.fn(() => ({ id: 'draw-cue', kind: 'draw', durationMs: 0, delayMs: 0 })),
    deriveMotionCues: jest.fn(() => []),
    usePrefersReducedMotion: jest.fn(() => false)
}));

describe('GameRoom character set room surface', () => {
    beforeEach(() => {
        localStorage.setItem('currentPlayerId', 'p1');
        mockState.geishaSet = 'hololive';
        mockHookState.isConnected = true;
        mockHookState.error = null;
        mockNavigate.mockReset();
        mockSendGameAction.mockReset();
    });

    afterEach(() => {
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
});
