// src/pages/Lobby/index.tsx - 保存玩家ID到localStorage
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gameWebSocket } from '../../services/websocket';
import config from '../../config/environment';

// Lobby 入口主畫面
const Lobby: React.FC = () => {
    // 玩家名稱輸入
    const [playerName, setPlayerName] = useState('');
    // 房間代碼輸入
    const [roomId, setRoomId] = useState('');
    // 是否正在連線或送出請求
    const [isConnecting, setIsConnecting] = useState(false);
    // 連線狀態顯示
    const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
    // 路由導向工具
    const navigate = useNavigate();
    // 最新玩家名稱（避免事件回呼讀到舊值）
    const playerNameRef = useRef('');

    // 同步最新玩家名稱到 ref，避免事件回呼讀到舊值
    useEffect(() => {
        playerNameRef.current = playerName;
    }, [playerName]);

    // 建立連線與註冊事件（只在首次掛載時執行）
    useEffect(() => {
        let isActive = true;

        // 連線 WebSocket（避免重複連線）
        const connectWS = async () => {
            setConnectionStatus('connecting');
            try {
                await gameWebSocket.connect(config.websocketUrl);
                if (!isActive) return;
                setConnectionStatus('connected');
                console.log('✅ [Lobby] WebSocket 連線成功');
            } catch (error) {
                if (!isActive) return;
                setConnectionStatus('disconnected');
                console.error('❌ [Lobby] WebSocket 連線失敗:', error);
            }
        };

        if (!gameWebSocket.isConnected()) {
            connectWS();
        } else {
            setConnectionStatus('connected');
        }

        // 房間建立成功後處理
        const handleRoomCreated = (payload: any) => {
            console.log('🏠 [Lobby] 房間建立成功，保存玩家ID並跳轉:', payload);
            setIsConnecting(false);

            // 保存當前玩家ID到localStorage
            localStorage.setItem('currentPlayerId', playerNameRef.current);

            gameWebSocket.off('ROOM_CREATED');
            gameWebSocket.off('PLAYER_JOINED');
            gameWebSocket.off('ERROR');

            navigate(`/game/${payload.roomId}`);
        };

        // 加入房間成功後處理
        const handlePlayerJoined = (payload: any) => {
            console.log('👤 [Lobby] 玩家加入成功，保存玩家ID並跳轉:', payload);
            setIsConnecting(false);

            // 保存當前玩家ID到localStorage
            localStorage.setItem('currentPlayerId', playerNameRef.current);

            gameWebSocket.off('ROOM_CREATED');
            gameWebSocket.off('PLAYER_JOINED');
            gameWebSocket.off('ERROR');

            navigate(`/game/${payload.roomId}`);
        };

        // 收到伺服器錯誤時提示使用者
        const handleError = (payload: any) => {
            console.error('❌ [Lobby] 伺服器錯誤:', payload);
            setIsConnecting(false);
            alert(`錯誤: ${payload.message}`);
        };

        console.log('📋 [Lobby] 註冊事件監聽器');
        gameWebSocket.on('ROOM_CREATED', handleRoomCreated);
        gameWebSocket.on('PLAYER_JOINED', handlePlayerJoined);
        gameWebSocket.on('ERROR', handleError);

        return () => {
            isActive = false;
            console.log('🧹 [Lobby] 組件卸載，清理事件監聽器');
            gameWebSocket.off('ROOM_CREATED');
            gameWebSocket.off('PLAYER_JOINED');
            gameWebSocket.off('ERROR');
        };
    }, [navigate]);

    // 建立房間請求
    const createRoom = () => {
        if (!playerName.trim() || connectionStatus !== 'connected') return;
        setIsConnecting(true);
        console.log('📤 [Lobby] 發送建立房間請求:', { playerId: playerName });
        gameWebSocket.send('CREATE_ROOM', { playerId: playerName });
    };

    // 加入房間請求
    const joinRoom = () => {
        if (!playerName.trim() || !roomId.trim() || connectionStatus !== 'connected') return;
        setIsConnecting(true);
        console.log('📤 [Lobby] 發送加入房間請求:', { roomId, playerId: playerName });
        gameWebSocket.send('JOIN_ROOM', { roomId, playerId: playerName });
    };

    // 依連線狀態回傳文字顏色
    const getStatusColor = () => {
        switch (connectionStatus) {
            case 'connected': return 'text-success';
            case 'connecting': return 'text-warning';
            default: return 'text-danger';
        }
    };

    // 依連線狀態回傳顯示文字
    const getStatusText = () => {
        switch (connectionStatus) {
            case 'connected': return '🟢 已連接到伺服器';
            case 'connecting': return '🟡 連接中...';
            default: return '🔴 未連接到伺服器';
        }
    };

    // 檢查當前網域，決定是否使用 Hash Router
    const shouldUseHash = () => {
        return window.location.host.includes('github.io');
    };

    return (
        <div className="lobby-background d-flex align-items-center justify-content-center">
            <div className="card p-4" style={{ minWidth: 350, maxWidth: 400 }}>
                <div className="text-center mb-4">
                    <h2 className="mb-3">花見小路</h2>
                    <p className="text-secondary">線上對戰版</p>
                    <small className={getStatusColor()}>
                        {getStatusText()}
                    </small>
                    {config.isDevelopment && (
                        <div className="mt-2">
                            <small className="text-muted">
                                環境: {process.env.NODE_ENV}<br />
                                WebSocket: {config.websocketUrl}<br />
                                Router: {shouldUseHash() ? 'HashRouter' : 'BrowserRouter'}
                            </small>
                        </div>
                    )}
                </div>

                <div className="mb-3">
                    <label className="form-label">玩家名稱</label>
                    <input
                        type="text"
                        className="form-control mb-3"
                        placeholder="輸入你的名稱"
                        value={playerName}
                        onChange={e => setPlayerName(e.target.value)}
                        disabled={isConnecting}
                        maxLength={20}
                    />
                    <button
                        className="btn btn-primary w-100"
                        onClick={createRoom}
                        disabled={!playerName.trim() || isConnecting || connectionStatus !== 'connected'}
                    >
                        {isConnecting ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2"></span>
                                建立中...
                            </>
                        ) : '🏠 建立房間'}
                    </button>
                </div>

                <hr className="my-4" />

                <div>
                    <label className="form-label">加入房間</label>
                    <input
                        type="text"
                        className="form-control mb-2"
                        placeholder="輸入房間代碼"
                        value={roomId}
                        onChange={e => setRoomId(e.target.value.toUpperCase())}
                        disabled={isConnecting}
                        maxLength={6}
                    />
                    <button
                        className="btn btn-success w-100"
                        onClick={joinRoom}
                        disabled={!playerName.trim() || !roomId.trim() || isConnecting || connectionStatus !== 'connected'}
                    >
                        {isConnecting ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2"></span>
                                加入中...
                            </>
                        ) : '🚪 加入房間'}
                    </button>
                </div>

                <div className="mt-4 pt-3 border-top">
                    <small className="text-muted">
                        <strong>遊戲說明：</strong><br />
                        透過四種行動收集物品卡，獲得藝妓的好感。<br />
                        控制四位以上藝妓或累積11點魅力值即可獲勝！
                    </small>
                </div>

                {config.isDevelopment && (
                    <div className="mt-3 p-2 bg-light rounded">
                        <small className="text-muted">
                            <strong>開發資訊：</strong><br />
                            連線狀態: {connectionStatus}<br />
                            已註冊事件: {gameWebSocket.messageHandlers?.size || 0}
                        </small>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Lobby;
