// frontend/src/hooks/useWebSocket.ts
import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { useGame } from '../contexts/GameContext';
import {
    ClientAction,
    ClientState,
    GameAction,
    GameState,
    ItemCard,
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

export interface DealAnimationStep {
    // 發牌順序索引
    order: number;
    // 目標玩家 ID
    playerId: string;
    // 發出的卡片
    card: ItemCard;
}

export interface CardDrawEvent {
    // 抽牌玩家 ID
    playerId: string;
    // 抽到的卡片
    card: ItemCard;
}

interface RoundCompletePayload {
    // 結算回合數
    round?: number;
}

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
        const result: OrderDecisionResultPayload = {
            firstPlayer: candidate.firstPlayer,
            secondPlayer: candidate.secondPlayer,
            order: candidate.order,
            gameState: candidate.gameState
        };
        if (!candidate.gameState) {
            delete result.gameState;
        }
        return result;
    }

    return null;
};

// WebSocket 主 Hook：處理連線、事件、狀態同步
export const useWebSocket = (gameId?: string | null, playerData?: Player | null) => {
    const [clientState, clientDispatch] = useReducer(clientReducer, initialClientState); // 建立客戶端狀態容器
    const { dispatch: gameDispatch } = useGame(); // 取得全域遊戲狀態的 dispatch
    const [dealQueue, setDealQueue] = useState<DealAnimationStep[]>([]);
    const [drawQueue, setDrawQueue] = useState<CardDrawEvent[]>([]);
    const [roundSummary, setRoundSummary] = useState<{ round: number } | null>(null);
    const roundSummaryTimerRef = useRef<number | null>(null);

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

        const handleDealAnimation = (payload: unknown) => {
            if (!payload || typeof payload !== 'object') {
                return;
            }

            const candidate = payload as { sequence?: unknown };
            if (!Array.isArray(candidate.sequence)) {
                return;
            }

            const normalized = candidate.sequence
                .map((step, index) => {
                    if (!step || typeof step !== 'object') {
                        return null;
                    }

                    const raw = step as Partial<DealAnimationStep> & { card?: ItemCard };
                    if (!raw.card || typeof raw.playerId !== 'string') {
                        return null;
                    }

                    return {
                        order: typeof raw.order === 'number' ? raw.order : index,
                        playerId: raw.playerId,
                        card: raw.card
                    } as DealAnimationStep;
                })
                .filter((step): step is DealAnimationStep => Boolean(step));

            setDealQueue(normalized.sort((a, b) => a.order - b.order));
        };

        const handleCardDrawn = (payload: unknown) => {
            if (!payload || typeof payload !== 'object') {
                return;
            }

            const candidate = payload as Partial<CardDrawEvent> & { card?: ItemCard };
            if (typeof candidate.playerId === 'string' && candidate.card && typeof candidate.card === 'object') {
                const drawEvent: CardDrawEvent = {
                    playerId: candidate.playerId,
                    card: candidate.card
                };
                setDrawQueue(prev => [...prev, drawEvent]);
            }
        };

        const handleRoundComplete = (payload: unknown) => {
            if (!payload || typeof payload !== 'object') {
                return;
            }

            const round = (payload as RoundCompletePayload).round;
            if (!round) {
                return;
            }

            setRoundSummary({ round });

            if (roundSummaryTimerRef.current) {
                window.clearTimeout(roundSummaryTimerRef.current);
            }

            roundSummaryTimerRef.current = window.setTimeout(() => {
                setRoundSummary(null);
            }, 2500);
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

            if (roundSummaryTimerRef.current) {
                window.clearTimeout(roundSummaryTimerRef.current);
                roundSummaryTimerRef.current = null;
            }
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
        registerEventHandler('ROUND_COMPLETE', handleRoundComplete);
        registerEventHandler('ORDER_DECISION_START', handleOrderDecisionStart);
        registerEventHandler('ORDER_DECISION_STARTED', handleOrderDecisionStart);
        registerEventHandler('ORDER_DECISION_RESULT', handleOrderDecisionResult);
        registerEventHandler('ORDER_DECISION_COMPLETED', handleOrderDecisionResult);
        registerEventHandler('ORDER_CONFIRMATION_UPDATE', handleOrderConfirmationUpdate);
        registerEventHandler('ORDER_CONFIRMATIONS_UPDATED', handleOrderConfirmationUpdate);
        registerEventHandler('ERROR', handleErrorMessage);
        registerEventHandler('GAME_ENDED', syncGameState);
        registerEventHandler('DEAL_ANIMATION', handleDealAnimation);
        registerEventHandler('CARD_DRAWN', handleCardDrawn);

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
            setDealQueue([]);
            setDrawQueue([]);
        };
    }, [gameId, playerData?.id, gameDispatch]);

    // 發送遊戲行動到伺服器
    const sendGameAction = useCallback((action: GameAction) => {
        if (!gameId || !playerData?.id) {
            console.warn('⚠️ [useWebSocket] 缺少 gameId，無法發送遊戲動作');
            return;
        }

        try {
            gameWebSocket.send('GAME_ACTION', { gameId, playerId: playerData.id, action });
        } catch (error) {
            const message = error instanceof Error ? error.message : '遊戲動作送出失敗';
            clientDispatch({ type: 'SET_ERROR', payload: { error: message } });
        }
    }, [gameId, playerData?.id]);

    // 確認順序（順序決定完成後使用）
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

    // 主動觸發順序決定（目前預留使用）
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

    // 清除錯誤訊息
    const clearError = useCallback(() => {
        clientDispatch({ type: 'CLEAR_ERROR' });
    }, []);

    // 消耗一個發牌動畫事件
    const consumeDealStep = useCallback(() => {
        setDealQueue(prev => prev.slice(1));
    }, []);

    // 消耗一個抽牌事件
    const consumeDrawEvent = useCallback(() => {
        setDrawQueue(prev => prev.slice(1));
    }, []);

    // 回傳給 UI 的狀態與操作
    return {
        gameState: clientState.gameState,
        isConnected: clientState.isConnected,
        isLoading: clientState.isLoading,
        error: clientState.error,
        roundSummary,
        sendGameAction,
        confirmOrder,
        startOrderDecision,
        clearError,
        dealQueue,
        consumeDealStep,
        drawQueue,
        consumeDrawEvent
    };
};
