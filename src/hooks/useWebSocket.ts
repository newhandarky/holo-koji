// frontend/src/hooks/useWebSocket.ts
import { useCallback, useReducer } from 'react';
import { useGame } from '../contexts/GameContext';
import {
    GameAction,
    Player
} from '@newhandarky/hanakoji-game-types';
import { gameWebSocket } from '../services/websocket';
import { frontendLogger } from '../utils/runtimeLogger';
import { clientReducer, initialClientState } from './useWebSocketState';
import { useWebSocketEventRuntime } from './useWebSocketEventRuntime';

export type { CardDrawEvent, DealAnimationEvent } from './webSocketPayloads';

// WebSocket 主 Hook：處理連線、事件、狀態同步
export const useWebSocket = (gameId?: string | null, playerData?: Player | null) => {
    const [clientState, clientDispatch] = useReducer(clientReducer, initialClientState); // 建立客戶端狀態容器
    const { dispatch: gameDispatch } = useGame(); // 取得全域遊戲狀態的 dispatch
    const {
        roundSummary,
        readyStatus,
        dealQueue,
        consumeDealEvent,
        drawQueue,
        consumeDrawEvent
    } = useWebSocketEventRuntime({
        gameId,
        playerId: playerData?.id,
        gameDispatch,
        clientDispatch
    });

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
