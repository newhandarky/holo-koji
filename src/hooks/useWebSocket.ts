// src/hooks/useWebSocket.ts - 最終修正版本，包含完整功能和詳細註解
import { useEffect } from 'react';
import { useGame } from '../contexts/GameContext';
import { gameWebSocket } from '../services/websocket';
import config from '../config/environment';

export const useWebSocket = () => {
    const { state, dispatch } = useGame();

    // 使用環境配置中的 WebSocket URL
    const serverUrl = config.websocketUrl;

    useEffect(() => {
        console.log('🔧 [useWebSocket] 開始初始化');
        console.log('🔧 [useWebSocket] 使用 WebSocket URL:', serverUrl);
        console.log('🔧 [useWebSocket] 環境:', process.env.NODE_ENV);

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
            } else {
                console.log('✅ [useWebSocket] WebSocket 已連接');
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
                } else {
                    console.warn('⚠️ [CRITICAL] payload.players 無效:', payload.players);
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

            // 處理遊戲動作
            gameWebSocket.on('GAME_ACTION', (payload) => {
                console.log('🎯 [useWebSocket] 收到 GAME_ACTION:', payload);
                if (payload.playerId && payload.action && payload.cards) {
                    console.log('✅ [useWebSocket] 執行 PLAY_ACTION dispatch');
                    dispatch({
                        type: 'PLAY_ACTION',
                        payload
                    });
                } else {
                    console.warn('⚠️ [useWebSocket] GAME_ACTION payload 無效:', payload);
                }
            });

            // 處理回合結束
            gameWebSocket.on('TURN_ENDED', (payload) => {
                console.log('⏭️ [useWebSocket] 收到 TURN_ENDED:', payload);
                dispatch({ type: 'END_TURN' });
            });

            // 處理遊戲結束
            gameWebSocket.on('GAME_ENDED', (payload) => {
                console.log('🏆 [useWebSocket] 收到 GAME_ENDED:', payload);
                dispatch({
                    type: 'END_GAME',
                    payload: { winner: payload.winner }
                });
            });

            // 處理玩家離開
            gameWebSocket.on('PLAYER_LEFT', (payload) => {
                console.log('👋 [useWebSocket] 收到 PLAYER_LEFT:', payload);
                alert(`玩家 ${payload.playerId} 已離開遊戲`);
            });

            // 處理錯誤
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

    // 發送動作到伺服器
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

    // 發送遊戲動作
    const sendGameAction = (action: any, cards: any[]) => {
        // 驗證遊戲狀態
        if (!state.players.length || state.phase !== 'playing') {
            console.warn('⚠️ [useWebSocket] 遊戲尚未開始或玩家不足');
            alert('遊戲尚未開始');
            return;
        }

        // 獲取當前玩家
        const currentPlayer = state.players[state.currentPlayer];
        if (!currentPlayer) {
            console.warn('⚠️ [useWebSocket] 找不到當前玩家');
            alert('找不到當前玩家');
            return;
        }

        // 驗證動作參數
        if (!action || !Array.isArray(cards)) {
            console.warn('⚠️ [useWebSocket] 動作參數無效:', { action, cards });
            alert('動作參數無效');
            return;
        }

        console.log('🎮 [useWebSocket] 發送遊戲動作:', {
            playerId: currentPlayer.id,
            action,
            cards: cards.length
        });

        sendAction('GAME_ACTION', {
            playerId: currentPlayer.id,
            action,
            cards
        });
    };

    // 結束回合
    const endTurn = () => {
        if (state.phase !== 'playing') {
            console.warn('⚠️ [useWebSocket] 遊戲未進行中，無法結束回合');
            return;
        }

        console.log('⏭️ [useWebSocket] 結束回合');
        sendAction('END_TURN', {});
    };

    // 離開遊戲
    const leaveGame = () => {
        console.log('🚪 [useWebSocket] 離開遊戲');
        sendAction('LEAVE_ROOM', {});
    };

    // 獲取連線狀態
    const getConnectionInfo = () => {
        return {
            isConnected: gameWebSocket.isConnected(),
            connectionState: gameWebSocket.getConnectionState(),
            serverUrl: serverUrl,
            registeredEvents: Array.from(gameWebSocket.messageHandlers.keys()),
            environment: {
                isDevelopment: config.isDevelopment,
                isProduction: config.isProduction,
                nodeEnv: process.env.NODE_ENV
            }
        };
    };

    // 重新連接
    const reconnect = async () => {
        console.log('🔄 [useWebSocket] 嘗試重新連接');
        try {
            await gameWebSocket.connect(serverUrl);
            console.log('✅ [useWebSocket] 重新連接成功');
            return true;
        } catch (error) {
            console.error('❌ [useWebSocket] 重新連接失敗:', error);
            return false;
        }
    };

    // 返回所有可用的方法和狀態
    return {
        // 基本動作
        sendAction,
        sendGameAction,
        endTurn,
        leaveGame,

        // 連線管理
        reconnect,

        // 狀態查詢
        isConnected: gameWebSocket.isConnected(),
        connectionState: gameWebSocket.getConnectionState(),
        getConnectionInfo,

        // 環境資訊
        serverUrl,
        isDevelopment: config.isDevelopment,
        isProduction: config.isProduction
    };
};