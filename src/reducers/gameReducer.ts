// src/contexts/gameReducer.ts - 添加順序決定狀態管理
export interface GameState {
    gameId: string;
    players: Player[];
    geishas: Geisha[];
    currentPlayer: number;
    phase: 'waiting' | 'deciding_order' | 'playing' | 'ended';
    round: number;
    winner?: string;
    // 新增順序決定相關狀態
    orderDecision: {
        isActive: boolean;
        phase: 'deciding' | 'result' | 'waiting_confirmation';
        players: string[];
        result?: {
            firstPlayer: string;
            secondPlayer: string;
            order: string[];
        };
        confirmations: string[];
        waitingFor: string[];
    };
}

export interface Player {
    id: string;
    name: string;
    hand: Card[];
    playedCards: Card[];
    secretCards: Card[];
    discardedCards: Card[];
    actionTokens: ActionToken[];
}

export interface Card {
    id: string;
    geishaId: number;
    type: string;
}

export interface Geisha {
    id: number;
    name: string;
    charmPoints: number;
    controlledBy: string | null;
}

export interface ActionToken {
    type: string;
    used: boolean;
}

export type GameAction =
    | { type: 'INIT_GAME'; payload: { gameId: string; players: Player[] } }
    | { type: 'PLAY_ACTION'; payload: any }
    | { type: 'END_TURN' }
    | { type: 'END_GAME'; payload: { winner: string } }
    // 新增順序決定相關動作
    | { type: 'START_ORDER_DECISION'; payload: { players: string[] } }
    | { type: 'ORDER_DECISION_RESULT'; payload: { firstPlayer: string; secondPlayer: string; order: string[] } }
    | { type: 'UPDATE_ORDER_CONFIRMATIONS'; payload: { confirmations: string[]; waitingFor: string[] } };

const initialGeishas: Geisha[] = [
    { id: 1, name: '洋子', charmPoints: 2, controlledBy: null },
    { id: 2, name: '彩葉', charmPoints: 2, controlledBy: null },
    { id: 3, name: '琉璃', charmPoints: 2, controlledBy: null },
    { id: 4, name: '杏樹', charmPoints: 3, controlledBy: null },
    { id: 5, name: '知世', charmPoints: 3, controlledBy: null },
    { id: 6, name: '美櫻', charmPoints: 4, controlledBy: null },
    { id: 7, name: '小雪', charmPoints: 5, controlledBy: null },
];

export const initialState: GameState = {
    gameId: '',
    players: [],
    geishas: initialGeishas,
    currentPlayer: 0,
    phase: 'waiting',
    round: 1,
    winner: undefined,
    // 初始化順序決定狀態
    orderDecision: {
        isActive: false,
        phase: 'deciding',
        players: [],
        result: undefined,
        confirmations: [],
        waitingFor: []
    }
};

export const gameReducer = (state: GameState, action: GameAction): GameState => {
    console.log('🔄 [Reducer] ===== 收到動作 =====');
    console.log('🔄 [Reducer] 動作類型:', action.type);
    console.log('🔄 [Reducer] 動作內容:', action);
    console.log('🔄 [Reducer] 當前狀態:', state);

    switch (action.type) {
        case 'INIT_GAME':
            console.log('🚨 [Reducer] ===== 處理 INIT_GAME =====');
            console.log('🚨 [Reducer] payload.gameId:', action.payload.gameId);
            console.log('🚨 [Reducer] payload.players:', action.payload.players);

            const newState = {
                ...state,
                gameId: action.payload.gameId,
                players: action.payload.players,
                phase: action.payload.players.length >= 2 ?
                    (action.payload.players[0].hand.length > 0 ? 'playing' as const : 'waiting' as const) :
                    'waiting' as const
            };

            console.log('✅ [Reducer] INIT_GAME 處理完成');
            console.log('✅ [Reducer] 新狀態 gameId:', newState.gameId);
            console.log('✅ [Reducer] 新狀態 players:', newState.players);
            console.log('✅ [Reducer] 新狀態 phase:', newState.phase);

            return newState;

        // 新增：開始順序決定
        case 'START_ORDER_DECISION':
            console.log('🎲 [Reducer] ===== 處理 START_ORDER_DECISION =====');
            return {
                ...state,
                phase: 'deciding_order',
                orderDecision: {
                    isActive: true,
                    phase: 'deciding',
                    players: action.payload.players,
                    result: undefined,
                    confirmations: [],
                    waitingFor: []
                }
            };

        // 新增：順序決定結果
        case 'ORDER_DECISION_RESULT':
            console.log('🎯 [Reducer] ===== 處理 ORDER_DECISION_RESULT =====');
            return {
                ...state,
                orderDecision: {
                    ...state.orderDecision,
                    phase: 'result',
                    result: action.payload,
                    waitingFor: state.orderDecision.players // 初始時所有玩家都需要確認
                }
            };

        // 新增：更新確認狀態
        case 'UPDATE_ORDER_CONFIRMATIONS':
            console.log('✅ [Reducer] ===== 處理 UPDATE_ORDER_CONFIRMATIONS =====');
            const updatedOrderDecision = {
                ...state,
                orderDecision: {
                    ...state.orderDecision,
                    phase: action.payload.waitingFor.length > 0 ? 'waiting_confirmation' as const : 'result' as const,
                    confirmations: action.payload.confirmations,
                    waitingFor: action.payload.waitingFor
                }
            };

            // 如果所有玩家都確認了，隱藏順序決定彈窗
            if (action.payload.waitingFor.length === 0) {
                return {
                    ...updatedOrderDecision,
                    orderDecision: {
                        ...updatedOrderDecision.orderDecision,
                        isActive: false
                    }
                };
            }

            return updatedOrderDecision;

        case 'PLAY_ACTION':
            console.log('🎯 [Reducer] ===== 處理 PLAY_ACTION =====');
            return {
                ...state,
                // 這裡可以添加具體的遊戲動作處理邏輯
            };

        case 'END_TURN':
            console.log('⏭️ [Reducer] ===== 處理 END_TURN =====');
            return {
                ...state,
                currentPlayer: (state.currentPlayer + 1) % state.players.length
            };

        case 'END_GAME':
            console.log('🏆 [Reducer] ===== 處理 END_GAME =====');
            return {
                ...state,
                phase: 'ended',
                winner: action.payload.winner
            };

        default:
            console.warn('⚠️ [Reducer] 未知動作類型:', action);
            return state;
    }
};