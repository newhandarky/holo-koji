// frontend/src/hooks/useWebSocket.ts
import { useCallback, useReducer } from 'react';
import { useGame } from '../contexts/GameContext';
import {
    GameAction,
    Player
} from '@newhandarky/hanakoji-game-types';
import { gameWebSocket } from '../services/websocket';
import { clientReducer, initialClientState } from './useWebSocketState';
import { useWebSocketEventRuntime } from './useWebSocketEventRuntime';
import {
    confirmOrderCommand,
    confirmReadyCommand,
    requestRematchCommand,
    sendGameActionCommand
} from './webSocketCommands';

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
        sendGameActionCommand({ gameId, playerId: playerData?.id, clientDispatch }, action);
    }, [clientDispatch, gameId, playerData?.id]);

    // 送出再來一場請求（同房間重開）
    const requestRematch = useCallback(() => {
        requestRematchCommand({ gameId, playerId: playerData?.id, clientDispatch });
    }, [clientDispatch, gameId, playerData?.id]);

    // 玩家準備確認
    const confirmReady = useCallback(() => {
        confirmReadyCommand({ gameId, playerId: playerData?.id, clientDispatch });
    }, [clientDispatch, gameId, playerData?.id]);

    // 確認順序（順序決定完成後使用）
    const confirmOrder = useCallback(() => {
        confirmOrderCommand({ gameId, playerId: playerData?.id, clientDispatch });
    }, [clientDispatch, gameId, playerData?.id]);

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
