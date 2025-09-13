// src/reducers/gameReducer.ts - 修正 TypeScript 類型錯誤
import { GameState, GameAction, Geisha } from '../types/game.types';

/*
 * 初始藝妓資料（依照桌遊規則）
 */
const initialGeishas: Geisha[] = [
    { id: 1, name: '洋子', charmPoints: 2, controlledBy: null },
    { id: 2, name: '彩葉', charmPoints: 2, controlledBy: null },
    { id: 3, name: '琉璃', charmPoints: 2, controlledBy: null },
    { id: 4, name: '杏樹', charmPoints: 3, controlledBy: null },
    { id: 5, name: '知世', charmPoints: 3, controlledBy: null },
    { id: 6, name: '美櫻', charmPoints: 4, controlledBy: null },
    { id: 7, name: '小雪', charmPoints: 5, controlledBy: null },
];

/*
 * 初始遊戲狀態
 */
export const initialGameState: GameState = {
    gameId: '',
    players: [],
    geishas: initialGeishas,
    currentPlayer: 0,
    phase: 'waiting',
    round: 1,
    winner: null,
};

/*
 * gameReducer: 根據動作更新遊戲狀態
 */
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
            console.log('🚨 [Reducer] payload.players.length:', action.payload.players?.length);

            if (!action.payload.players || !Array.isArray(action.payload.players)) {
                console.error('❌ [Reducer] payload.players 不是有效陣列:', action.payload.players);
                return state;
            }

            const newState = {
                ...state,
                gameId: action.payload.gameId || state.gameId,
                players: action.payload.players,
                phase: (action.payload.players.length >= 2) ? 'playing' as const : 'waiting' as const,
            };

            console.log('✅ [Reducer] INIT_GAME 處理完成');
            console.log('✅ [Reducer] 新狀態 gameId:', newState.gameId);
            console.log('✅ [Reducer] 新狀態 players:', newState.players);
            console.log('✅ [Reducer] 新狀態 players.length:', newState.players.length);
            console.log('✅ [Reducer] 新狀態 phase:', newState.phase);
            console.log('✅ [Reducer] 完整新狀態:', newState);

            return newState;

        case 'DRAW_CARD':
            console.log('🎴 [Reducer] 處理 DRAW_CARD');
            const drawState = {
                ...state,
                players: state.players.map(player =>
                    player.id === action.payload.playerId
                        ? { ...player, hand: [...player.hand, action.payload.card] }
                        : player
                ),
            };
            console.log('✅ [Reducer] DRAW_CARD 處理完成');
            return drawState;

        case 'PLAY_ACTION':
            console.log('🎯 [Reducer] 處理 PLAY_ACTION');
            const actionState = playAction(state, action.payload);
            console.log('✅ [Reducer] PLAY_ACTION 處理完成');
            return actionState;

        case 'END_TURN':
            console.log('⏭️ [Reducer] 處理 END_TURN');
            const turnState = {
                ...state,
                currentPlayer: state.currentPlayer === 0 ? 1 : 0,
            };
            console.log('✅ [Reducer] END_TURN 處理完成，當前玩家:', turnState.currentPlayer);
            return turnState;

        case 'SCORE_ROUND':
            console.log('📊 [Reducer] 處理 SCORE_ROUND');
            const scoreState = scoreRound(state);
            console.log('✅ [Reducer] SCORE_ROUND 處理完成');
            return scoreState;

        case 'END_GAME':
            console.log('🏆 [Reducer] 處理 END_GAME');
            const endState = {
                ...state,
                phase: 'ended' as const,
                winner: action.payload.winner,
            };
            console.log('✅ [Reducer] END_GAME 處理完成，獲勝者:', endState.winner);
            return endState;

        default:
            // 修正 TypeScript 錯誤：使用 any 類型來處理未知動作
            console.log('⚠️ [Reducer] 未知動作類型:', (action as any).type);
            console.log('⚠️ [Reducer] 未知動作內容:', action);
            return state;
    }
};

/*
 * playAction: 根據不同類型 action 處理行動邏輯
 */
const playAction = (state: GameState, payload: any): GameState => {
    console.log('🎯 [Reducer] 處理玩家動作:', payload);

    const { playerId, action, cards } = payload;
    const playerIndex = state.players.findIndex(p => p.id === playerId);

    if (playerIndex === -1) {
        console.log('⚠️ [Reducer] 找不到玩家:', playerId);
        return state;
    }

    switch (action.type) {
        case 'secret':
            return {
                ...state,
                players: state.players.map((player, idx) =>
                    idx === playerIndex
                        ? {
                            ...player,
                            hand: player.hand.filter(c => c.id !== cards[0]?.id),
                            secretCards: [...player.secretCards, cards[0]],
                            actionTokens: player.actionTokens.map(token =>
                                token.type === 'secret' ? { ...token, used: true } : token
                            ),
                        }
                        : player
                ),
            };

        case 'trade-off':
            return {
                ...state,
                players: state.players.map((player, idx) =>
                    idx === playerIndex
                        ? {
                            ...player,
                            hand: player.hand.filter(c => !cards.some((x: any) => x.id === c.id)),
                            discardedCards: [...player.discardedCards, ...cards],
                            actionTokens: player.actionTokens.map(token =>
                                token.type === 'trade-off' ? { ...token, used: true } : token
                            ),
                        }
                        : player
                ),
            };

        case 'gift':
            return handleGiftAction(state, playerIndex, cards);

        case 'competition':
            return handleCompetitionAction(state, playerIndex, cards);

        default:
            console.log('⚠️ [Reducer] 未知行動類型:', action.type);
            return state;
    }
};

/*
 * handleGiftAction: 處理贈予行動
 */
const handleGiftAction = (state: GameState, playerIndex: number, cards: any[]): GameState => {
    return {
        ...state,
        players: state.players.map((player, idx) =>
            idx === playerIndex
                ? {
                    ...player,
                    hand: player.hand.filter(c => !cards.some((x: any) => x.id === c.id)),
                    actionTokens: player.actionTokens.map(token =>
                        token.type === 'gift' ? { ...token, used: true } : token
                    ),
                }
                : player
        ),
    };
};

/*
 * handleCompetitionAction: 處理競爭行動
 */
const handleCompetitionAction = (state: GameState, playerIndex: number, cards: any[]): GameState => {
    return {
        ...state,
        players: state.players.map((player, idx) =>
            idx === playerIndex
                ? {
                    ...player,
                    hand: player.hand.filter(c => !cards.some((x: any) => x.id === c.id)),
                    actionTokens: player.actionTokens.map(token =>
                        token.type === 'competition' ? { ...token, used: true } : token
                    ),
                }
                : player
        ),
    };
};

/*
 * scoreRound: 計分回合（可依規則實作）
 */
const scoreRound = (state: GameState): GameState => {
    // 暫時回傳原狀態
    return state;
};