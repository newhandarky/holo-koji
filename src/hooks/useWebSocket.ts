// src/hooks/useWebSocket.ts - 添加順序決定功能
import { useEffect } from 'react';
import { useGame } from '../contexts/GameContext';
import { gameWebSocket } from '../services/websocket';
import config from '../config/environment';

export const useWebSocket = () => {
    const { state, dispatch } = useGame();
    const serverUrl = config.websocketUrl;

    useEffect(() => {
        console.log('🔧 [useWebSocket] 使用 WebSocket URL:', serverUrl);
        console.log('🔧 [useWebSocket] 環境:', process.env.NODE_ENV);

        const ensureConnection = async () => {
            if (!gameWebSocket.isConnected()) {
                try {
                    await gameWebSocket.connect(serverUrl);
                    console.log('✅ [useWebSocket] WebSocket 連接成功');
                } catch (error) {
                    console.error('❌ [useWebSocket] WebSocket 連接失敗:', error);
                }
            }
        };

        ensureConnection();

        const registerEvents = () => {
            console.log('📋 [useWebSocket] 開始註冊遊戲事件');

            const eventTypes = [
                'GAME_STARTED', 'GAME_STATE_UPDATED', 'GAME_ACTION',
                'TURN_ENDED', 'GAME_ENDED', 'PLAYER_LEFT', 'ERROR',
                'ROOM_CREATED', 'PLAYER_JOINED',
                // 新增順序決定相關事件
                'ORDER_DECISION_START', 'ORDER_DECISION_RESULT', 'ORDER_CONFIRMATION_UPDATE'
            ];

            eventTypes.forEach(eventType => {
                gameWebSocket.off(eventType);
            });

            // 處理遊戲狀態更新
            gameWebSocket.on('GAME_STATE_UPDATED', (payload) => {
                console.log('🔄 [CRITICAL] 收到 GAME_STATE_UPDATED 事件！');
                if (payload.players && Array.isArray(payload.players)) {
                    dispatch({
                        type: 'INIT_GAME',
                        payload: {
                            gameId: payload.gameId,
                            players: payload.players
                        }
                    });
                }
            });

            // 處理遊戲開始
            gameWebSocket.on('GAME_STARTED', (payload) => {
                console.log('🎮 [CRITICAL] 收到 GAME_STARTED 事件！');
                if (payload.players && payload.players.length > 0) {
                    dispatch({
                        type: 'INIT_GAME',
                        payload: {
                            gameId: payload.gameId,
                            players: payload.players
                        }
                    });
                }
            });

            // 新增：處理順序決定開始
            gameWebSocket.on('ORDER_DECISION_START', (payload) => {
                console.log('🎲 [useWebSocket] 收到 ORDER_DECISION_START:', payload);
                dispatch({
                    type: 'START_ORDER_DECISION',
                    payload: {
                        players: payload.players
                    }
                });
            });

            // 新增：處理順序決定結果
            gameWebSocket.on('ORDER_DECISION_RESULT', (payload) => {
                console.log('🎯 [useWebSocket] 收到 ORDER_DECISION_RESULT:', payload);
                dispatch({
                    type: 'ORDER_DECISION_RESULT',
                    payload: {
                        firstPlayer: payload.firstPlayer,
                        secondPlayer: payload.secondPlayer,
                        order: payload.order
                    }
                });
            });

            // 新增：處理確認狀態更新
            gameWebSocket.on('ORDER_CONFIRMATION_UPDATE', (payload) => {
                console.log('✅ [useWebSocket] 收到 ORDER_CONFIRMATION_UPDATE:', payload);
                dispatch({
                    type: 'UPDATE_ORDER_CONFIRMATIONS',
                    payload: {
                        confirmations: payload.confirmations,
                        waitingFor: payload.waitingFor
                    }
                });
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

        registerEvents();

        return () => {
            console.log('🧹 [useWebSocket] 清理事件監聽器');
            const eventTypes = [
                'GAME_STARTED', 'GAME_STATE_UPDATED', 'GAME_ACTION',
                'TURN_ENDED', 'GAME_ENDED', 'PLAYER_LEFT', 'ERROR',
                'ORDER_DECISION_START', 'ORDER_DECISION_RESULT', 'ORDER_CONFIRMATION_UPDATE'
            ];

            eventTypes.forEach(eventType => {
                gameWebSocket.off(eventType);
            });
        };
    }, [dispatch, serverUrl]);

    const sendAction = (type: string, payload: any) => {
        try {
            console.log('📤 [useWebSocket] 發送動作:', { type, payload });

            if (!gameWebSocket.isConnected()) {
                console.warn('⚠️ [useWebSocket] WebSocket 未連接，無法發送動作');
                alert('連線已斷開，請重新整理頁面');
                return;
            }

            gameWebSocket.send(type, payload);
            console.log('✅ [useWebSocket] 動作發送成功');
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

    // 新增：確認順序
    const confirmOrder = () => {
        console.log('✅ [useWebSocket] 發送確認順序');
        sendAction('CONFIRM_ORDER', {});
    };

    return {
        sendAction,
        sendGameAction,
        endTurn,
        leaveGame,
        confirmOrder, // 新增
        isConnected: gameWebSocket.isConnected(),
        connectionState: gameWebSocket.getConnectionState(),
        serverUrl,
        isDevelopment: config.isDevelopment,
        isProduction: config.isProduction
    };
};