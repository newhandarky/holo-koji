import { Dispatch, useCallback, useEffect, useRef, useState } from 'react';
import {
    ClientAction,
    GameAction as GameContextAction,
    JoinRoomPayload,
    ReadyStatusPayload,
    ServerToClientEventMap,
    ServerToClientEventType
} from '@newhandarky/hanakoji-game-types';
import { gameWebSocket } from '../services/websocket';
import { getStoredRoomSessionToken } from '../utils/roomSession';
import config from '../config/environment';
import {
    CardDrawEvent,
    DealAnimationEvent,
    resolveGameStatePayload,
} from './webSocketPayloads';
import {
    clearRuntimeQueueOnCleanup,
    consumeRuntimeEvent
} from './webSocketEventQueue';
import {
    createWebSocketRuntimeHandlers,
    registerWebSocketRuntimeHandlers
} from './webSocketEventHandlerRegistry';

// 連線事件的保留名稱，避免與伺服器事件衝突
const CONNECTION_OPEN = '__OPEN__';
const CONNECTION_CLOSE = '__CLOSE__';

interface UseWebSocketEventRuntimeOptions {
    gameId?: string | null;
    playerId?: string;
    gameDispatch: Dispatch<GameContextAction>;
    clientDispatch: Dispatch<ClientAction>;
}

export const useWebSocketEventRuntime = ({
    gameId,
    playerId,
    gameDispatch,
    clientDispatch
}: UseWebSocketEventRuntimeOptions) => {
    const [drawQueue, setDrawQueue] = useState<CardDrawEvent[]>([]);
    const [dealQueue, setDealQueue] = useState<DealAnimationEvent[]>([]);
    const [roundSummary, setRoundSummary] = useState<{ round: number } | null>(null);
    const roundSummaryTimerRef = useRef<number | null>(null);
    const [readyStatus, setReadyStatus] = useState<ReadyStatusPayload | null>(null);
    const gameDispatchRef = useRef(gameDispatch);
    const clientDispatchRef = useRef(clientDispatch);

    useEffect(() => {
        gameDispatchRef.current = gameDispatch;
    }, [gameDispatch]);

    useEffect(() => {
        clientDispatchRef.current = clientDispatch;
    }, [clientDispatch]);

    useEffect(() => {
        if (!gameId || !playerId) {
            return;
        }

        let isActive = true; // 確保卸載後不再更新 state
        const unsubscribeHandlers: Array<() => void> = []; // 紀錄本 hook 註冊的 listener，避免清掉其他頁面 listener

        const safeDispatch: typeof clientDispatch = (action) => {
            if (isActive) {
                clientDispatchRef.current(action);
            }
        };

        const syncGameState = (payload: unknown) => {
            const gameState = resolveGameStatePayload(payload);
            if (!gameState) {
                return;
            }

            if (gameState.phase !== 'deciding_order') {
                setReadyStatus(null);
            }

            gameDispatchRef.current({ type: 'SYNC_SERVER_STATE', payload: gameState });
            safeDispatch({ type: 'SYNC_SERVER_STATE', payload: gameState });
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
                const attachedSession = gameWebSocket.getAttachedSession();
                if (attachedSession?.roomId === gameId && attachedSession.playerId === playerId) {
                    return;
                }

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

        registerWebSocketRuntimeHandlers(
            registerEventHandler,
            createWebSocketRuntimeHandlers({
                gameId,
                playerId,
                gameDispatchRef,
                safeDispatch,
                syncGameState,
                setDrawQueue,
                setDealQueue,
                setRoundSummary,
                roundSummaryTimerRef,
                setReadyStatus
            })
        );

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
            setDrawQueue(clearRuntimeQueueOnCleanup);
            setDealQueue(clearRuntimeQueueOnCleanup);
            setReadyStatus(null);
        };
    }, [gameId, playerId]);

    // 消耗一個抽牌事件
    const consumeDrawEvent = useCallback(() => {
        setDrawQueue(consumeRuntimeEvent);
    }, []);

    const consumeDealEvent = useCallback(() => {
        setDealQueue(consumeRuntimeEvent);
    }, []);

    return {
        roundSummary,
        readyStatus,
        dealQueue,
        consumeDealEvent,
        drawQueue,
        consumeDrawEvent
    };
};
