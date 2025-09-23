// // frontend/src/hooks/useWebSocket.ts
// import { useEffect, useRef, useCallback } from 'react';
// import { useGame } from '../contexts/GameContext';
// import io, { Socket } from 'socket.io-client';
// import {
//     GameAction, Player, WebSocketMessage,
//     WebSocketEventType,
//     GameStartedPayload,
//     PlayerJoinedPayload,
//     OrderDecisionResultPayload,
//     ClientAction,
//     ClientState,
//     GameState
// } from "game-shared-types"

// // 前端狀態 reducer
// const clientReducer = (state: ClientState, action: ClientAction): ClientState => {
//     switch (action.type) {
//         case 'SYNC_SERVER_STATE':
//             return {
//                 ...state,
//                 gameState: action.payload,
//                 isLoading: false,
//                 error: null
//             };

//         case 'SET_CONNECTION_STATUS':
//             return {
//                 ...state,
//                 isConnected: action.payload.isConnected
//             };

//         case 'SET_ERROR':
//             return {
//                 ...state,
//                 error: action.payload.error,
//                 isLoading: false
//             };

//         case 'CLEAR_ERROR':
//             return {
//                 ...state,
//                 error: null
//             };

//         case 'SET_LOADING':
//             return {
//                 ...state,
//                 isLoading: action.payload.isLoading
//             };

//         default:
//             return state;
//     }
// };

// const initialClientState: ClientState = {
//     gameState: {} as GameState, // 初始空狀態
//     isConnected: false,
//     isLoading: true,
//     error: null
// };

// export const useWebSocket = (gameId: string, playerData: Player) => {
//     const { dispatch } = useGame();
//     const socketRef = useRef<Socket | null>(null);
//     const reconnectAttempts = useRef(0);
//     const maxReconnectAttempts = 5;

//     // 連接到後端
//     useEffect(() => {
//         if (!gameId || !playerData) return;

//         console.log(`🟢 [useWebSocket] 開始連接到遊戲: ${gameId}`);

//         // 建立 Socket.IO 連接
//         socketRef.current = io('http://localhost:3001', {
//             transports: ['websocket'],
//             forceNew: true
//         });

//         const socket = socketRef.current;

//         // 連接成功
//         socket.on('connect', () => {
//             console.log('🟢 [useWebSocket] Socket.IO 連線建立成功');
//             reconnectAttempts.current = 0;

//             // 自動加入遊戲
//             socket.emit('JOIN_GAME', {
//                 gameId,
//                 playerData
//             });
//         });

//         // 監聽遊戲狀態更新 (對應您原本的訊息處理器)
//         socket.on('GAME_STATE_UPDATE', (message: WebSocketMessage) => {
//             console.log('📨 [useWebSocket] 收到遊戲狀態更新:', message);

//             switch (message.type) {
//                 case 'GAME_STARTED':
//                     console.log('🚨 [useWebSocket] 遊戲開始');
//                     dispatch({
//                         type: 'SYNC_SERVER_STATE',
//                         payload: message.payload
//                     });
//                     break;

//                 case 'STATE_CHANGED':
//                     console.log('🔄 [useWebSocket] 遊戲狀態變更');
//                     dispatch({
//                         type: 'SYNC_SERVER_STATE',
//                         payload: message.payload
//                     });
//                     break;

//                 case 'ORDER_CONFIRMED':
//                     console.log('✅ [useWebSocket] 順序確認完成');
//                     dispatch({
//                         type: 'SYNC_SERVER_STATE',
//                         payload: message.payload
//                     });
//                     break;

//                 default:
//                     console.warn('⚠️ [useWebSocket] 未知訊息類型:', message.type);
//             }
//         });

//         // 連接錯誤處理
//         socket.on('connect_error', (error) => {
//             console.error('❌ [useWebSocket] 連接錯誤:', error);
//         });

//         // 斷線處理
//         socket.on('disconnect', (reason) => {
//             console.log('🔴 [useWebSocket] 連線斷開:', reason);

//             if (reason === 'io server disconnect') {
//                 // 伺服器主動斷開，嘗試重連
//                 if (reconnectAttempts.current < maxReconnectAttempts) {
//                     reconnectAttempts.current++;
//                     console.log(`🔄 [useWebSocket] 嘗試重新連接 (${reconnectAttempts.current}/${maxReconnectAttempts})`);
//                 }
//             }
//         });

//         return () => {
//             console.log('🔌 [useWebSocket] 清理連接');
//             socket.disconnect();
//         };
//     }, [gameId, playerData?.id, dispatch]);

//     // 發送遊戲動作
//     const sendGameAction = useCallback((action: GameAction) => {
//         if (socketRef.current?.connected) {
//             console.log('📤 [useWebSocket] 發送遊戲動作:', action);
//             socketRef.current.emit('GAME_ACTION', {
//                 gameId,
//                 action
//             });
//         } else {
//             console.error('❌ [useWebSocket] 無法發送動作，連接未建立');
//         }
//     }, [gameId]);

//     // 確認順序決定
//     const confirmOrder = useCallback(() => {
//         if (socketRef.current?.connected) {
//             console.log('✅ [useWebSocket] 確認順序');
//             socketRef.current.emit('CONFIRM_ORDER', {
//                 gameId,
//                 playerId: playerData.id
//             });
//         }
//     }, [gameId, playerData?.id]);

//     // 連接狀態
//     const isConnected = socketRef.current?.connected || false;

//     return {
//         sendGameAction,
//         confirmOrder,
//         isConnected
//     };
// };


// frontend/src/hooks/useWebSocket.ts
import { useEffect, useRef, useCallback, useReducer } from 'react';
import { useGame } from '../contexts/GameContext';
import io, { Socket } from 'socket.io-client';
import {
    GameAction,
    Player,
    WebSocketMessage,
    WebSocketEventType,
    GameStartedPayload,
    PlayerJoinedPayload,
    OrderDecisionResultPayload,
    ClientAction,
    ClientState,
    GameState
} from "game-shared-types";

// 前端狀態 reducer
const clientReducer = (state: ClientState, action: ClientAction): ClientState => {
    switch (action.type) {
        case 'SYNC_SERVER_STATE':
            return {
                ...state,
                gameState: action.payload,
                isLoading: false,
                error: null
            };

        case 'SET_CONNECTION_STATUS':
            return {
                ...state,
                isConnected: action.payload.isConnected
            };

        case 'SET_ERROR':
            return {
                ...state,
                error: action.payload.error,
                isLoading: false
            };

        case 'CLEAR_ERROR':
            return {
                ...state,
                error: null
            };

        case 'SET_LOADING':
            return {
                ...state,
                isLoading: action.payload.isLoading
            };

        default:
            return state;
    }
};

const initialClientState: ClientState = {
    gameState: {} as GameState,
    isConnected: false,
    isLoading: true,
    error: null
};

export const useWebSocket = (gameId?: string | null, playerData?: Player | null) => {
    // 使用內部的 clientReducer 管理 WebSocket 相關狀態
    const [clientState, clientDispatch] = useReducer(clientReducer, initialClientState);

    // 使用 GameContext 的 dispatch 管理遊戲狀態
    const { dispatch: gameDispatch } = useGame();

    const socketRef = useRef<Socket | null>(null);
    const reconnectAttempts = useRef(0);
    const maxReconnectAttempts = 5;

    useEffect(() => {
        if (!gameId || !playerData) {
            return;
        }

        console.log(`🟢 [useWebSocket] 開始連接到遊戲: ${gameId}`);

        clientDispatch({ type: 'SET_LOADING', payload: { isLoading: true } });

        // 建立 Socket.IO 連接
        socketRef.current = io('http://localhost:3001', {
            transports: ['websocket'],
            forceNew: true
        });

        const socket = socketRef.current;

        // 連接成功
        socket.on('connect', () => {
            console.log('🟢 [useWebSocket] Socket.IO 連線建立成功');
            reconnectAttempts.current = 0;

            clientDispatch({
                type: 'SET_CONNECTION_STATUS',
                payload: { isConnected: true }
            });

            // 自動加入遊戲
            socket.emit('JOIN_GAME', {
                gameId,
                playerData
            });
        });

        // 統一的 WebSocket 訊息處理函數
        const handleWebSocketMessage = (eventType: WebSocketEventType | string, message: WebSocketMessage) => {
            console.log(`📨 [useWebSocket] 收到事件: ${eventType}`, message);

            switch (eventType) {
                case 'GAME_STARTED':
                    const gameStartedPayload = message.payload as GameStartedPayload;
                    console.log('🚨 [useWebSocket] 遊戲開始:', gameStartedPayload.message);

                    // 更新遊戲狀態
                    gameDispatch({
                        type: 'SYNC_SERVER_STATE',
                        payload: gameStartedPayload.gameState
                    });

                    // 更新客戶端狀態
                    clientDispatch({
                        type: 'SYNC_SERVER_STATE',
                        payload: gameStartedPayload.gameState
                    });
                    break;

                case 'PLAYER_JOINED':
                    const playerJoinedPayload = message.payload as PlayerJoinedPayload;
                    console.log('👥 [useWebSocket] 玩家加入:', playerJoinedPayload.player.name);

                    gameDispatch({
                        type: 'SYNC_SERVER_STATE',
                        payload: playerJoinedPayload.gameState
                    });

                    clientDispatch({
                        type: 'SYNC_SERVER_STATE',
                        payload: playerJoinedPayload.gameState
                    });
                    break;

                case 'GAME_STATE_UPDATED':
                case 'STATE_CHANGED': // 兼容您原本的事件名稱
                    console.log('🔄 [useWebSocket] 遊戲狀態更新');

                    gameDispatch({
                        type: 'SYNC_SERVER_STATE',
                        payload: message.payload as GameState
                    });

                    clientDispatch({
                        type: 'SYNC_SERVER_STATE',
                        payload: message.payload as GameState
                    });
                    break;

                case 'ORDER_DECISION_START':
                case 'ORDER_DECISION_STARTED': // 新的命名
                    console.log('🎲 [useWebSocket] 開始順序決定');

                    gameDispatch({
                        type: 'SYNC_SERVER_STATE',
                        payload: message.payload.gameState || message.payload
                    });
                    break;

                case 'ORDER_DECISION_RESULT':
                case 'ORDER_DECISION_COMPLETED': // 新的命名
                case 'ORDER_CONFIRMED': // 兼容您原本的事件名稱
                    const orderResultPayload = message.payload as OrderDecisionResultPayload;
                    console.log('✅ [useWebSocket] 順序決定結果:', orderResultPayload.order || '已確認');

                    gameDispatch({
                        type: 'SYNC_SERVER_STATE',
                        payload: orderResultPayload.gameState || message.payload
                    });
                    break;

                case 'ORDER_CONFIRMATION_UPDATE':
                case 'ORDER_CONFIRMATIONS_UPDATED': // 新的命名
                    console.log('📝 [useWebSocket] 確認狀態更新');

                    gameDispatch({
                        type: 'SYNC_SERVER_STATE',
                        payload: message.payload.gameState || message.payload
                    });
                    break;

                case 'ERROR':
                    console.error('❌ [useWebSocket] 伺服器錯誤:', message.payload);

                    clientDispatch({
                        type: 'SET_ERROR',
                        payload: { error: message.payload.message || message.payload }
                    });
                    break;

                default:
                    console.warn('⚠️ [useWebSocket] 未知事件類型:', eventType);
            }
        };

        // 監聽您原本的 GAME_STATE_UPDATE 事件
        socket.on('GAME_STATE_UPDATE', (message: WebSocketMessage) => {
            console.log('📨 [useWebSocket] 收到遊戲狀態更新:', message);
            handleWebSocketMessage(message.type, message);
        });

        // 註冊所有新的 WebSocket 事件監聽器
        const eventTypes: WebSocketEventType[] = [
            'GAME_STARTED',
            'GAME_STATE_UPDATED',
            'PLAYER_JOINED',
            'PLAYER_LEFT',
            'ORDER_DECISION_START',
            'ORDER_DECISION_STARTED',
            'ORDER_DECISION_RESULT',
            'ORDER_DECISION_COMPLETED',
            'ORDER_CONFIRMATION_UPDATE',
            'ORDER_CONFIRMATIONS_UPDATED',
            'TURN_ENDED',
            'GAME_ENDED',
            'ERROR',
            'ROOM_CREATED'
        ];

        eventTypes.forEach(eventType => {
            socket.on(eventType, (message: WebSocketMessage) => {
                handleWebSocketMessage(eventType, message);
            });
        });

        // 連接錯誤處理
        socket.on('connect_error', (error) => {
            console.error('❌ [useWebSocket] 連接錯誤:', error);

            clientDispatch({
                type: 'SET_ERROR',
                payload: { error: `連接錯誤: ${error.message}` }
            });
        });

        // 斷線處理
        socket.on('disconnect', (reason) => {
            console.log('🔴 [useWebSocket] 連線斷開:', reason);

            clientDispatch({
                type: 'SET_CONNECTION_STATUS',
                payload: { isConnected: false }
            });

            if (reason === 'io server disconnect') {
                // 伺服器主動斷開，嘗試重連
                if (reconnectAttempts.current < maxReconnectAttempts) {
                    reconnectAttempts.current++;
                    console.log(`🔄 [useWebSocket] 嘗試重新連接 (${reconnectAttempts.current}/${maxReconnectAttempts})`);
                }
            }
        });

        return () => {
            console.log('🔌 [useWebSocket] 清理連接');
            socket.disconnect();
        };
    }, [gameId, playerData, gameDispatch]);

    // 發送遊戲動作
    const sendGameAction = useCallback((action: GameAction) => {
        if (socketRef.current?.connected) {
            console.log('📤 [useWebSocket] 發送遊戲動作:', action);
            socketRef.current.emit('GAME_ACTION', {
                gameId,
                action
            });
        } else {
            console.error('❌ [useWebSocket] 無法發送動作，連接未建立');
        }
    }, [gameId]);

    // 確認順序決定（保留您原本的方法）
    const confirmOrder = useCallback(() => {
        if (socketRef.current?.connected && gameId && playerData) {
            console.log('✅ [useWebSocket] 確認順序');
            socketRef.current.emit('CONFIRM_ORDER', {
                gameId,
                playerId: playerData.id
            });
        }
    }, [gameId, playerData]);

    // 開始順序決定（新增的方法）
    const startOrderDecision = useCallback((players: string[]) => {
        if (socketRef.current?.connected && gameId) {
            console.log('🎲 [useWebSocket] 開始順序決定');
            socketRef.current.emit('START_ORDER_DECISION', {
                gameId,
                players
            });
        }
    }, [gameId]);

    // 清除錯誤
    const clearError = useCallback(() => {
        clientDispatch({ type: 'CLEAR_ERROR' });
    }, []);

    return {
        // 客戶端狀態
        gameState: clientState.gameState,
        isConnected: clientState.isConnected,
        isLoading: clientState.isLoading,
        error: clientState.error,

        // 方法
        sendGameAction,
        confirmOrder, // 保留您原本的方法
        startOrderDecision, // 新增的方法
        clearError
    };
};
