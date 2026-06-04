import { Dispatch } from 'react';
import { ClientAction, GameAction } from '@newhandarky/hanakoji-game-types';
import { gameWebSocket } from '../services/websocket';
import { frontendLogger } from '../utils/runtimeLogger';

interface WebSocketCommandContext {
    gameId?: string | null;
    playerId?: string;
    clientDispatch: Dispatch<ClientAction>;
}

const commandContextSummary = ({ gameId, playerId }: WebSocketCommandContext) => ({
    hasGameId: Boolean(gameId),
    hasPlayerId: Boolean(playerId)
});

const dispatchSendError = (
    clientDispatch: Dispatch<ClientAction>,
    error: unknown,
    fallbackMessage: string
) => {
    const message = error instanceof Error ? error.message : fallbackMessage;
    clientDispatch({ type: 'SET_ERROR', payload: { error: message } });
};

export const sendGameActionCommand = (
    context: WebSocketCommandContext,
    action: GameAction
) => {
    if (!context.gameId || !context.playerId) {
        frontendLogger.warn('⚠️ [useWebSocket] 缺少 gameId，無法發送遊戲動作', commandContextSummary(context));
        return;
    }

    try {
        gameWebSocket.send('GAME_ACTION', {
            gameId: context.gameId,
            playerId: context.playerId,
            action
        });
    } catch (error) {
        dispatchSendError(context.clientDispatch, error, '遊戲動作送出失敗');
    }
};

export const requestRematchCommand = (context: WebSocketCommandContext) => {
    if (!context.gameId || !context.playerId) {
        frontendLogger.warn('⚠️ [useWebSocket] 缺少必要資訊，無法發送再來一場', commandContextSummary(context));
        return;
    }

    try {
        gameWebSocket.send('REMATCH_REQUEST', {
            gameId: context.gameId,
            playerId: context.playerId
        });
    } catch (error) {
        dispatchSendError(context.clientDispatch, error, '再來一場送出失敗');
    }
};

export const confirmReadyCommand = (context: WebSocketCommandContext) => {
    if (!context.gameId || !context.playerId) {
        frontendLogger.warn('⚠️ [useWebSocket] 缺少必要資訊，無法確認準備', commandContextSummary(context));
        return;
    }

    try {
        gameWebSocket.send('READY_CONFIRM', {
            gameId: context.gameId,
            playerId: context.playerId
        });
    } catch (error) {
        dispatchSendError(context.clientDispatch, error, '準備確認送出失敗');
    }
};

export const confirmOrderCommand = (context: WebSocketCommandContext) => {
    if (!context.gameId || !context.playerId) {
        frontendLogger.warn('⚠️ [useWebSocket] 缺少必要資訊，無法確認順序', commandContextSummary(context));
        return;
    }

    try {
        gameWebSocket.send('CONFIRM_ORDER', {
            gameId: context.gameId,
            playerId: context.playerId
        });
    } catch (error) {
        dispatchSendError(context.clientDispatch, error, '確認順序失敗');
    }
};
