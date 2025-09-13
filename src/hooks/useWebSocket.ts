// src/hooks/useWebSocket.ts - 最終修正版本
import { useEffect } from 'react';
import { useGame } from '../contexts/GameContext';
import { gameWebSocket } from '../services/websocket';

export const useWebSocket = (serverUrl: string) => {
    const { state, dispatch } = useGame();

    useEffect(() => {
        console.log('🔧 [useWebSocket] 開始初始化');

        // 確保 WebSocket 連線
        const ensureConnection = async () => {
            if (!gameWebSocket.isConnected()) {
                console.log('🔄 [useWebSocket] WebSocket 未連線，嘗試連接...');
                try {
                    await gameWebSocket.connect(serverUrl);
                    console.log('✅ [useWebSocket] WebSocket 連接成功');
                } catch (error) {
                    console.error('❌ [useWebSocket] WebSocket 連接失敗:', error);
                }
            }
        };

        ensureConnection();

        // 立即註冊事件處理器
        const registerEvents = () => {
            console.log('📋 [useWebSocket] 開始註冊遊戲事件');

            // 清理所有舊的事件監聽器
            const eventTypes = [
                'GAME_STARTED', 'GAME_STATE_UPDATED', 'GAME_ACTION',
                'TURN_ENDED', 'GAME_ENDED', 'PLAYER_LEFT', 'ERROR',
                'ROOM_CREATED', 'PLAYER_JOINED' // 也清理 Lobby 事件
            ];

            eventTypes.forEach(eventType => {
                gameWebSocket.off(eventType);
            });

            // 處理遊戲狀態更新（最重要的事件）
            gameWebSocket.on('GAME_STATE_UPDATED', (payload) => {
                console.log('🔄 [CRITICAL] 收到 GAME_STATE_UPDATED 事件！');
                console.log('🔄 [CRITICAL] payload:', payload);
                console.log('🔄 [CRITICAL] players:', payload.players);
                console.log('🔄 [CRITICAL] gameId:', payload.gameId);

                if (payload.players && Array.isArray(payload.players)) {
                    console.log('✅ [CRITICAL] 執行 INIT_GAME dispatch (GAME_STATE_UPDATED)');
                    dispatch({
                        type: 'INIT_GAME',
                        payload: {
                            gameId: payload.gameId,
                            players: payload.players
                        }
                    });
                    console.log('✅ [CRITICAL] GAME_STATE_UPDATED dispatch 完成');
                }
            });

            // 處理遊戲開始
            gameWebSocket.on('GAME_STARTED', (payload) => {
                console.log('🎮 [CRITICAL] 收到 GAME_STARTED 事件！');
                console.log('🎮 [CRITICAL] payload:', payload);
                console.log('🎮 [CRITICAL] players:', payload.players);
                console.log('🎮 [CRITICAL] gameId:', payload.gameId);

                if (payload.players && payload.players.length > 0) {
                    console.log('✅ [CRITICAL] 執行 INIT_GAME dispatch (GAME_STARTED)');
                    dispatch({
                        type: 'INIT_GAME',
                        payload: {
                            gameId: payload.gameId,
                            players: payload.players
                        }
                    });
                    console.log('✅ [CRITICAL] GAME_STARTED dispatch 完成');
                } else {
                    console.warn('⚠️ [CRITICAL] payload.players 為空或未定義');
                }
            });

            gameWebSocket.on('GAME_ACTION', (payload) => {
                console.log('🎯 [useWebSocket] 收到 GAME_ACTION:', payload);
                if (payload.playerId && payload.action && payload.cards) {
                    dispatch({
                        type: 'PLAY_ACTION',
                        payload
                    });
                }
            });

            gameWebSocket.on('TURN_ENDED', (payload) => {
                console.log('⏭️ [useWebSocket] 收到 TURN_ENDED:', payload);
                dispatch({ type: 'END_TURN' });
            });

            gameWebSocket.on('GAME_ENDED', (payload) => {
                console.log('🏆 [useWebSocket] 收到 GAME_ENDED:', payload);
                dispatch({
                    type: 'END_GAME',
                    payload: { winner: payload.winner }
                });
            });

            gameWebSocket.on('PLAYER_LEFT', (payload) => {
                console.log('👋 [useWebSocket] 收到 PLAYER_LEFT:', payload);
                alert(`玩家 ${payload.playerId} 已離開遊戲`);
            });

            gameWebSocket.on('ERROR', (payload) => {
                console.error('❌ [useWebSocket] 收到 ERROR:', payload);
                alert(`遊戲錯誤: ${payload.message || '未知錯誤'}`);
            });

            console.log('📋 [useWebSocket] 已註冊的事件監聽器:', Array.from(gameWebSocket.messageHandlers.keys()));
        };

        // 立即註冊事件（不延遲）
        registerEvents();

        // 清理函數
        return () => {
            console.log('🧹 [useWebSocket] 清理事件監聽器');
            const eventTypes = [
                'GAME_STARTED', 'GAME_STATE_UPDATED', 'GAME_ACTION',
                'TURN_ENDED', 'GAME_ENDED', 'PLAYER_LEFT', 'ERROR'
            ];

            eventTypes.forEach(eventType => {
                gameWebSocket.off(eventType);
            });
        };
    }, [dispatch, serverUrl]);

    // 發送動作
    const sendAction = (type: string, payload: any) => {
        try {
            console.log('📤 [useWebSocket] 發送動作:', { type, payload });
            gameWebSocket.send(type, payload);
        } catch (error) {
            console.error('❌ [useWebSocket] 發送失敗:', error);
            alert('發送失敗，請檢查網路連線');
        }
    };

    const sendGameAction = (action: any, cards: any[]) => {
        if (!state.players.length || state.phase !== 'playing') {
            console.warn('⚠️ [useWebSocket] 遊戲尚未開始或玩家不足');
            return;
        }

        const currentPlayer = state.players[state.currentPlayer];
        if (!currentPlayer) {
            console.warn('⚠️ [useWebSocket] 找不到當前玩家');
            return;
        }

        sendAction('GAME_ACTION', {
            playerId: currentPlayer.id,
            action,
            cards
        });
    };

    const endTurn = () => {
        sendAction('END_TURN', {});
    };

    const leaveGame = () => {
        sendAction('LEAVE_ROOM', {});
    };

    return {
        sendAction,
        sendGameAction,
        endTurn,
        leaveGame,
        isConnected: gameWebSocket.isConnected(),
        connectionState: gameWebSocket.getConnectionState()
    };
};