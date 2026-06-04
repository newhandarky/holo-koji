// frontend/src/hooks/useWebSocket.ts
import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { useGame } from '../contexts/GameContext';
import {
    GameAction,
    JoinRoomPayload,
    Player,
    ReadyStatusPayload,
    ServerToClientEventMap,
    ServerToClientEventType
} from '@newhandarky/hanakoji-game-types';
import { gameWebSocket } from '../services/websocket';
import { frontendLogger } from '../utils/runtimeLogger';
import { clearRoomSessionToken, getStoredRoomSessionToken } from '../utils/roomSession';
import config from '../config/environment';
import { clientReducer, initialClientState } from './useWebSocketState';
import {
    CardDrawEvent,
    DealAnimationEvent,
    cardDrawEvent,
    dealAnimationEvent,
    normalizeErrorPayload,
    orderConfirmationUpdate,
    orderDecisionPlayers,
    orderDecisionResult,
    readyStatusPayload,
    resolveGameStatePayload,
    roundCompletePayload
} from './webSocketPayloads';

export type { CardDrawEvent, DealAnimationEvent } from './webSocketPayloads';

// 連線事件的保留名稱，避免與伺服器事件衝突
const CONNECTION_OPEN = '__OPEN__';
const CONNECTION_CLOSE = '__CLOSE__';
const PLAYER_ID_TAKEN_ERROR = '這個房間的重連憑證已失效，請返回大廳重新加入或更換名稱。';

// WebSocket 主 Hook：處理連線、事件、狀態同步
export const useWebSocket = (gameId?: string | null, playerData?: Player | null) => {
    const [clientState, clientDispatch] = useReducer(clientReducer, initialClientState); // 建立客戶端狀態容器
    const { dispatch: gameDispatch } = useGame(); // 取得全域遊戲狀態的 dispatch
    const [drawQueue, setDrawQueue] = useState<CardDrawEvent[]>([]);
    const [dealQueue, setDealQueue] = useState<DealAnimationEvent[]>([]);
    const [roundSummary, setRoundSummary] = useState<{ round: number } | null>(null);
    const roundSummaryTimerRef = useRef<number | null>(null);
    const [readyStatus, setReadyStatus] = useState<ReadyStatusPayload | null>(null);

    useEffect(() => {
        const playerId = playerData?.id;
        if (!gameId || !playerId) {
            return;
        }

        let isActive = true; // 確保卸載後不再更新 state
        const unsubscribeHandlers: Array<() => void> = []; // 紀錄本 hook 註冊的 listener，避免清掉其他頁面 listener

        const safeDispatch: typeof clientDispatch = (action) => {
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
            const update = orderConfirmationUpdate(payload);
            if (!update) {
                return;
            }

            gameDispatch({
                type: 'UPDATE_ORDER_CONFIRMATIONS',
                payload: update
            });
        };

        const handleErrorMessage = (payload: unknown) => {
            const errorPayload = normalizeErrorPayload(payload);
            if (errorPayload.code === 'PLAYER_ID_TAKEN') {
                clearRoomSessionToken(gameId, playerId);
                safeDispatch({ type: 'SET_ERROR', payload: { error: PLAYER_ID_TAKEN_ERROR } });
                return;
            }
            safeDispatch({ type: 'SET_ERROR', payload: { error: errorPayload.message } });
        };

        const handleCardDrawn = (payload: unknown) => {
            const drawEvent = cardDrawEvent(payload);
            if (drawEvent) {
                setDrawQueue(prev => [...prev, drawEvent]);
            }
        };

        const handleDealAnimation = (payload: unknown) => {
            const dealEvent = dealAnimationEvent(payload);
            if (dealEvent) {
                setDealQueue((previous) => [...previous, dealEvent]);
            }
        };

        const handleRoundComplete = (payload: unknown) => {
            const roundPayload = roundCompletePayload(payload);
            if (!roundPayload) {
                return;
            }

            setRoundSummary({ round: roundPayload.round! });

            if (roundSummaryTimerRef.current) {
                window.clearTimeout(roundSummaryTimerRef.current);
            }

            roundSummaryTimerRef.current = window.setTimeout(() => {
                setRoundSummary(null);
            }, 2500);
        };

        const handleReadyCheck = (payload: unknown) => {
            const candidate = readyStatusPayload(payload);
            if (candidate) {
                setReadyStatus(candidate);
            }
        };

        const handleReadyStatus = (payload: unknown) => {
            const candidate = readyStatusPayload(payload);
            if (!candidate) {
                return;
            }
            if (candidate.waitingFor.length === 0) {
                setReadyStatus(null);
            } else {
                setReadyStatus(candidate);
            }
        };

        const ignoreLifecycleEvent = () => {
            // 這些事件目前只作為 server 廣播輔助，不需要額外前端處理；
            // 明確註冊 no-op handler，避免正常流程被記成「找不到處理器」警告。
        };

        const registerEventHandler = <TType extends ServerToClientEventType>(
            eventType: TType,
            handler: (payload: ServerToClientEventMap[TType]) => void
        ) => {
            const unsubscribe = gameWebSocket.on(eventType, handler as Parameters<typeof gameWebSocket.on<TType>>[1]);
            unsubscribeHandlers.push(unsubscribe);
        };

        const cleanupHandlers = () => {
            while (unsubscribeHandlers.length > 0) {
                unsubscribeHandlers.pop()?.();
            }

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
                const roomSessionToken = getStoredRoomSessionToken(gameId, playerId);
                const joinPayload: JoinRoomPayload = {
                    roomId: gameId,
                    playerId,
                    ...(roomSessionToken ? { roomSessionToken } : {})
                };
                gameWebSocket.send('JOIN_ROOM', joinPayload);
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
        registerEventHandler('READY_CHECK', handleReadyCheck);
        registerEventHandler('READY_STATUS', handleReadyStatus);
        registerEventHandler('ROUND_COMPLETE', handleRoundComplete);
        registerEventHandler('ORDER_DECISION_START', handleOrderDecisionStart);
        registerEventHandler('ORDER_DECISION_STARTED', handleOrderDecisionStart);
        registerEventHandler('ORDER_DECISION_RESULT', handleOrderDecisionResult);
        registerEventHandler('ORDER_DECISION_COMPLETED', handleOrderDecisionResult);
        registerEventHandler('ORDER_CONFIRMATION_UPDATE', handleOrderConfirmationUpdate);
        registerEventHandler('ORDER_CONFIRMATIONS_UPDATED', handleOrderConfirmationUpdate);
        registerEventHandler('ERROR', handleErrorMessage);
        registerEventHandler('GAME_ENDED', syncGameState);
        registerEventHandler('CARD_DRAWN', handleCardDrawn);
        registerEventHandler('DEAL_ANIMATION', handleDealAnimation);
        registerEventHandler('ACTION_EXECUTED', ignoreLifecycleEvent);

        unsubscribeHandlers.push(gameWebSocket.on(CONNECTION_OPEN, handleOpen));
        unsubscribeHandlers.push(gameWebSocket.on(CONNECTION_CLOSE, handleClose));

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
            setDrawQueue([]);
            setDealQueue([]);
        };
    }, [gameId, playerData?.id, gameDispatch]);

    // 發送遊戲行動到伺服器
    const sendGameAction = useCallback((action: GameAction) => {
        if (!gameId || !playerData?.id) {
            frontendLogger.warn('⚠️ [useWebSocket] 缺少 gameId，無法發送遊戲動作', {
                hasGameId: Boolean(gameId),
                hasPlayerId: Boolean(playerData?.id)
            });
            return;
        }

        try {
            gameWebSocket.send('GAME_ACTION', { gameId, playerId: playerData.id, action });
        } catch (error) {
            const message = error instanceof Error ? error.message : '遊戲動作送出失敗';
            clientDispatch({ type: 'SET_ERROR', payload: { error: message } });
        }
    }, [gameId, playerData?.id]);

    // 送出再來一場請求（同房間重開）
    const requestRematch = useCallback(() => {
        if (!gameId || !playerData?.id) {
            frontendLogger.warn('⚠️ [useWebSocket] 缺少必要資訊，無法發送再來一場', {
                hasGameId: Boolean(gameId),
                hasPlayerId: Boolean(playerData?.id)
            });
            return;
        }

        try {
            gameWebSocket.send('REMATCH_REQUEST', { gameId, playerId: playerData.id });
        } catch (error) {
            const message = error instanceof Error ? error.message : '再來一場送出失敗';
            clientDispatch({ type: 'SET_ERROR', payload: { error: message } });
        }
    }, [gameId, playerData?.id]);

    // 玩家準備確認
    const confirmReady = useCallback(() => {
        if (!gameId || !playerData?.id) {
            frontendLogger.warn('⚠️ [useWebSocket] 缺少必要資訊，無法確認準備', {
                hasGameId: Boolean(gameId),
                hasPlayerId: Boolean(playerData?.id)
            });
            return;
        }

        try {
            gameWebSocket.send('READY_CONFIRM', { gameId, playerId: playerData.id });
        } catch (error) {
            const message = error instanceof Error ? error.message : '準備確認送出失敗';
            clientDispatch({ type: 'SET_ERROR', payload: { error: message } });
        }
    }, [gameId, playerData?.id]);

    // 確認順序（順序決定完成後使用）
    const confirmOrder = useCallback(() => {
        if (!gameId || !playerData?.id) {
            frontendLogger.warn('⚠️ [useWebSocket] 缺少必要資訊，無法確認順序', {
                hasGameId: Boolean(gameId),
                hasPlayerId: Boolean(playerData?.id)
            });
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

    // 清除錯誤訊息
    const clearError = useCallback(() => {
        clientDispatch({ type: 'CLEAR_ERROR' });
    }, []);

    // 消耗一個抽牌事件
    const consumeDrawEvent = useCallback(() => {
        setDrawQueue(prev => prev.slice(1));
    }, []);

    const consumeDealEvent = useCallback(() => {
        setDealQueue(prev => prev.slice(1));
    }, []);

    const leaveRoom = useCallback(() => {
        gameWebSocket.disconnect();
    }, []);

    // 回傳給 UI 的狀態與操作
    return {
        gameState: clientState.gameState,
        isConnected: clientState.isConnected,
        isLoading: clientState.isLoading,
        error: clientState.error,
        roundSummary,
        readyStatus,
        sendGameAction,
        requestRematch,
        confirmReady,
        confirmOrder,
        clearError,
        leaveRoom,
        dealQueue,
        consumeDealEvent,
        drawQueue,
        consumeDrawEvent
    };
};
