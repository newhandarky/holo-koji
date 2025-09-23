// frontend/src/hooks/useWebSocket.ts
import { useEffect, useRef, useCallback } from 'react';
import { useGame } from '../contexts/GameContext';
import io, { Socket } from 'socket.io-client';
import { GameAction, Player } from "game-shared-types"

// !
interface WebSocketMessage {
    type: string;
    payload: any;
}

export const useWebSocket = (gameId: string, playerData: Player) => {
    const { dispatch } = useGame();
    const socketRef = useRef<Socket | null>(null);
    const reconnectAttempts = useRef(0);
    const maxReconnectAttempts = 5;

    // 連接到後端
    useEffect(() => {
        if (!gameId || !playerData) return;

        console.log(`🟢 [useWebSocket] 開始連接到遊戲: ${gameId}`);

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

            // 自動加入遊戲
            socket.emit('JOIN_GAME', {
                gameId,
                playerData
            });
        });

        // 監聽遊戲狀態更新 (對應您原本的訊息處理器)
        socket.on('GAME_STATE_UPDATE', (message: WebSocketMessage) => {
            console.log('📨 [useWebSocket] 收到遊戲狀態更新:', message);

            switch (message.type) {
                case 'GAME_STARTED':
                    console.log('🚨 [useWebSocket] 遊戲開始');
                    dispatch({
                        type: 'SYNC_SERVER_STATE',
                        payload: message.payload
                    });
                    break;

                case 'STATE_CHANGED':
                    console.log('🔄 [useWebSocket] 遊戲狀態變更');
                    dispatch({
                        type: 'SYNC_SERVER_STATE',
                        payload: message.payload
                    });
                    break;

                case 'ORDER_CONFIRMED':
                    console.log('✅ [useWebSocket] 順序確認完成');
                    dispatch({
                        type: 'SYNC_SERVER_STATE',
                        payload: message.payload
                    });
                    break;

                default:
                    console.warn('⚠️ [useWebSocket] 未知訊息類型:', message.type);
            }
        });

        // 連接錯誤處理
        socket.on('connect_error', (error) => {
            console.error('❌ [useWebSocket] 連接錯誤:', error);
        });

        // 斷線處理
        socket.on('disconnect', (reason) => {
            console.log('🔴 [useWebSocket] 連線斷開:', reason);

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
    }, [gameId, playerData?.id, dispatch]);

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

    // 確認順序決定
    const confirmOrder = useCallback(() => {
        if (socketRef.current?.connected) {
            console.log('✅ [useWebSocket] 確認順序');
            socketRef.current.emit('CONFIRM_ORDER', {
                gameId,
                playerId: playerData.id
            });
        }
    }, [gameId, playerData?.id]);

    // 連接狀態
    const isConnected = socketRef.current?.connected || false;

    return {
        sendGameAction,
        confirmOrder,
        isConnected
    };
};
