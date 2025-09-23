// frontend/src/hooks/useWebSocket.ts
import { useCallback, useEffect, useReducer } from 'react';
import { useGame } from '../contexts/GameContext';
import {
    ClientAction,
    ClientState,
    GameAction,
    GameState,
    OrderDecisionResultPayload,
    OrderDecisionStartPayload,
    Player,
    WebSocketEventType
} from 'game-shared-types';
import { gameWebSocket } from '../services/websocket';
import config from '../config/environment';

// 連線事件的保留名稱，避免與伺服器事件衝突
const CONNECTION_OPEN = '__OPEN__';
const CONNECTION_CLOSE = '__CLOSE__';

// 前端狀態 reducer（保留型別同步，避免直接改變原始狀態）
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

// 初始的客戶端狀態快照
const initialClientState: ClientState = {
    gameState: {} as GameState,
    isConnected: false,
    isLoading: true,
    error: null
};

// 解析廣播 payload 中的 GameState，確保型別安全
const resolveGameStatePayload = (payload: unknown): GameState | null => {
    if (!payload || typeof payload !== 'object') {
        return null;
    }

    if ('gameState' in payload && (payload as { gameState: GameState }).gameState) {
        return (payload as { gameState: GameState }).gameState;
    }

    if ('gameId' in payload && 'players' in payload) {
        return payload as GameState;
    }

    return null;
};

// 讀取順序決定事件中的玩家列表
const orderDecisionPlayers = (payload: unknown): string[] => {
    if (!payload || typeof payload !== 'object') {
        return [];
    }

    if ('players' in payload && Array.isArray((payload as OrderDecisionStartPayload).players)) {
        return (payload as OrderDecisionStartPayload).players;
    }

    return [];
};

// 讀取順序決定結果（允許缺少 gameState）
const orderDecisionResult = (payload: unknown): OrderDecisionResultPayload | null => {
    if (!payload || typeof payload !== 'object') {
        return null;
    }

    const candidate = payload as Partial<OrderDecisionResultPayload>;
    if (candidate.firstPlayer && candidate.secondPlayer && Array.isArray(candidate.order)) {
        return {
            firstPlayer: candidate.firstPlayer,
            secondPlayer: candidate.secondPlayer,
            order: candidate.order,
            gameState: candidate.gameState
        };
    }

    return null;
};

export const useWebSocket = (gameId?: string | null, playerData?: Player | null) => {
    const [clientState, clientDispatch] = useReducer(clientReducer, initialClientState); // 建立客戶端狀態容器
    const { dispatch: gameDispatch } = useGame(); // 取得全域遊戲狀態的 dispatch

    useEffect(() => {
        const playerId = playerData?.id;
        if (!gameId || !playerId) {
            return;
        }

        let isActive = true; // 確保卸載後不再更新 state
        const handlerMap: Record<string, (payload: unknown) => void> = {}; // 快速紀錄已註冊的事件

        const safeDispatch = (action: ClientAction) => {
            if (isActive) {
                clientDispatch(action);
            }
        };

        const syncGameState = (payload: unknown) => {
            const gameState = resolveGameStatePayload(payload);
            if (!gameState) {
                return;
            }

            gameDispatch({ type: 'SYNC_SERVER_STATE', payload: gameState });
            safeDispatch({ type: 'SYNC_SERVER_STATE', payload: gameState });
        };

        const handleOrderDecisionStart = (payload: unknown) => {
            const players = orderDecisionPlayers(payload);
            if (players.length === 0) {
                return;
            }

            gameDispatch({ type: 'START_ORDER_DECISION', payload: { players } });
        };

        const handleOrderDecisionResult = (payload: unknown) => {
            const resultPayload = orderDecisionResult(payload);
            if (!resultPayload) {
                return;
            }

            gameDispatch({
                type: 'ORDER_DECISION_RESULT',
                payload: {
                    firstPlayer: resultPayload.firstPlayer,
                    secondPlayer: resultPayload.secondPlayer,
                    order: resultPayload.order
                }
            });

            if (resultPayload.gameState) {
                syncGameState(resultPayload.gameState);
            }
        };

        const handleOrderConfirmationUpdate = (payload: unknown) => {
            if (!payload || typeof payload !== 'object') {
                return;
            }

            const candidate = payload as { confirmations?: unknown; waitingFor?: unknown };
            const confirmations = Array.isArray(candidate.confirmations) ? (candidate.confirmations as string[]) : [];
            const waitingFor = Array.isArray(candidate.waitingFor) ? (candidate.waitingFor as string[]) : [];

            gameDispatch({
                type: 'UPDATE_ORDER_CONFIRMATIONS',
                payload: { confirmations, waitingFor }
            });
        };

        const handleErrorMessage = (payload: unknown) => {
            const message = typeof payload === 'string'
                ? payload
                : (payload && typeof payload === 'object' && 'message' in payload)
                    ? String((payload as { message: unknown }).message)
                    : '未知錯誤';
            safeDispatch({ type: 'SET_ERROR', payload: { error: message } });
        };

        const registerEventHandler = (eventType: WebSocketEventType | string, handler: (payload: unknown) => void) => {
            handlerMap[eventType] = handler;
            gameWebSocket.on(eventType, handler);
        };

        const cleanupHandlers = () => {
            Object.keys(handlerMap).forEach(eventType => {
                gameWebSocket.off(eventType);
            });
            gameWebSocket.off(CONNECTION_OPEN);
            gameWebSocket.off(CONNECTION_CLOSE);
        };

        const handleOpen = () => {
            safeDispatch({ type: 'SET_CONNECTION_STATUS', payload: { isConnected: true } });
            safeDispatch({ type: 'SET_LOADING', payload: { isLoading: false } });
            safeDispatch({ type: 'CLEAR_ERROR' });

            try {
                gameWebSocket.send('JOIN_ROOM', { roomId: gameId, playerId });
            } catch (error) {
                const message = error instanceof Error ? error.message : '無法加入房間';
                safeDispatch({ type: 'SET_ERROR', payload: { error: message } });
            }
        };

        const handleClose = () => {
            safeDispatch({ type: 'SET_CONNECTION_STATUS', payload: { isConnected: false } });
            safeDispatch({ type: 'SET_LOADING', payload: { isLoading: true } });
        };

        registerEventHandler('GAME_STATE_UPDATE', syncGameState);
        registerEventHandler('GAME_STATE_UPDATED', syncGameState);
        registerEventHandler('GAME_STATE_SYNC', syncGameState);
        registerEventHandler('STATE_CHANGED', syncGameState);
        registerEventHandler('GAME_STARTED', syncGameState);
        registerEventHandler('ORDER_DECISION_START', handleOrderDecisionStart);
        registerEventHandler('ORDER_DECISION_STARTED', handleOrderDecisionStart);
        registerEventHandler('ORDER_DECISION_RESULT', handleOrderDecisionResult);
        registerEventHandler('ORDER_DECISION_COMPLETED', handleOrderDecisionResult);
        registerEventHandler('ORDER_CONFIRMATION_UPDATE', handleOrderConfirmationUpdate);
        registerEventHandler('ORDER_CONFIRMATIONS_UPDATED', handleOrderConfirmationUpdate);
        registerEventHandler('ERROR', handleErrorMessage);

        gameWebSocket.on(CONNECTION_OPEN, handleOpen);
        gameWebSocket.on(CONNECTION_CLOSE, handleClose);

        if (gameWebSocket.isConnected()) {
            handleOpen();
        } else {
            safeDispatch({ type: 'SET_LOADING', payload: { isLoading: true } });
            gameWebSocket.connect(config.websocketUrl).catch((error) => {
                const message = error instanceof Error ? error.message : '連線失敗';
                handleClose();
                safeDispatch({ type: 'SET_ERROR', payload: { error: message } });
            });
        }

        return () => {
            isActive = false;
            cleanupHandlers();
        };
    }, [gameId, playerData?.id, gameDispatch]);

    const sendGameAction = useCallback((action: GameAction) => {
        if (!gameId) {
            console.warn('⚠️ [useWebSocket] 缺少 gameId，無法發送遊戲動作');
            return;
        }

        try {
            gameWebSocket.send('GAME_ACTION', { gameId, action });
        } catch (error) {
            const message = error instanceof Error ? error.message : '遊戲動作送出失敗';
            clientDispatch({ type: 'SET_ERROR', payload: { error: message } });
        }
    }, [gameId]);

    const confirmOrder = useCallback(() => {
        if (!gameId || !playerData?.id) {
            console.warn('⚠️ [useWebSocket] 缺少必要資訊，無法確認順序');
            return;
        }

        try {
            gameWebSocket.send('CONFIRM_ORDER', {
                gameId,
                playerId: playerData.id
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : '確認順序失敗';
            clientDispatch({ type: 'SET_ERROR', payload: { error: message } });
        }
    }, [gameId, playerData?.id]);

    const startOrderDecision = useCallback((players: string[]) => {
        if (!gameId) {
            console.warn('⚠️ [useWebSocket] 缺少 gameId，無法啟動順序決定');
            return;
        }

        try {
            gameWebSocket.send('START_ORDER_DECISION', {
                gameId,
                players
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : '啟動順序決定失敗';
            clientDispatch({ type: 'SET_ERROR', payload: { error: message } });
        }
    }, [gameId]);

    const clearError = useCallback(() => {
        clientDispatch({ type: 'CLEAR_ERROR' });
    }, []);

    return {
        gameState: clientState.gameState,
        isConnected: clientState.isConnected,
        isLoading: clientState.isLoading,
        error: clientState.error,
        sendGameAction,
        confirmOrder,
        startOrderDecision,
        clearError
    };
};
