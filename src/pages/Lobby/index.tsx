// src/pages/Lobby/index.tsx - 保存玩家ID到localStorage
import React, { useEffect, useRef, useState } from 'react';
import { GeishaSet } from 'game-shared-types';
import { useNavigate } from 'react-router-dom';
import { gameWebSocket } from '../../services/websocket';
import config from '../../config/environment';
import { getInviteRoomIdFromLocation, getLineProfile, LineProfile } from '../../utils/lineLiff';
import { frontendLogger } from '../../utils/runtimeLogger';
import { CHARACTER_SET_OPTIONS } from './characterSetOptions';

// Lobby 入口主畫面
const Lobby: React.FC = () => {
    // 玩家名稱輸入
    const [playerName, setPlayerName] = useState('');
    // 房間代碼輸入
    const [roomId, setRoomId] = useState('');
    // 對戰模式（online = 玩家對戰，npc = 對戰 AI）
    const [matchMode, setMatchMode] = useState<'online' | 'npc'>('online');
    // AI 難度（僅 NPC 模式使用）
    const [aiDifficulty, setAiDifficulty] = useState<'easy' | 'medium' | 'hard' | 'expert' | 'hell'>('easy');
    // 藝妓組合選擇（online / npc 共用）
    const [selectedGeishaSet, setSelectedGeishaSet] = useState<GeishaSet>('default');
    // 是否正在連線或送出請求
    const [isConnecting, setIsConnecting] = useState(false);
    // 連線狀態顯示
    const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
    // LINE 使用者資料（若在 LIFF 內）
    const [lineProfile, setLineProfile] = useState<LineProfile | null>(null);
    // 路由導向工具
    const navigate = useNavigate();
    // 最新玩家名稱（避免事件回呼讀到舊值）
    const playerNameRef = useRef('');

    // 同步最新玩家名稱到 ref，避免事件回呼讀到舊值
    useEffect(() => {
        playerNameRef.current = playerName;
    }, [playerName]);

    // 若網址帶 roomId，預填加入房間欄位
    useEffect(() => {
        const { roomId: invitedRoomId, source } = getInviteRoomIdFromLocation();
        if (!invitedRoomId) return;

        const normalizedRoomId = invitedRoomId.toUpperCase();
        setRoomId(normalizedRoomId);
        setMatchMode('online');

        if (source === 'liff') {
            const nextParams = new URLSearchParams(window.location.search);
            nextParams.set('roomId', normalizedRoomId);
            nextParams.delete('liff.state');
            const nextUrl = `${window.location.pathname}?${nextParams.toString()}`;
            window.history.replaceState(null, '', nextUrl);
        }
    }, []);

    // 取得 LINE 使用者資料（若在 LIFF 內）
    useEffect(() => {
        let isActive = true;

        const loadLineProfile = async () => {
            try {
                const profile = await getLineProfile();
                if (!profile || !isActive) return;

                setLineProfile(profile);
                localStorage.setItem('lineUserId', profile.userId);
                if (profile.pictureUrl) {
                    localStorage.setItem('lineAvatarUrl', profile.pictureUrl);
                }
                if (profile.displayName) {
                    localStorage.setItem('lineDisplayName', profile.displayName);
                }

                if (!playerNameRef.current) {
                    setPlayerName(profile.displayName);
                }
            } catch (error) {
                frontendLogger.warn('⚠️ 讀取 LINE 使用者資料失敗', {
                    error: error instanceof Error ? error.message : 'unknown'
                });
            }
        };

        loadLineProfile();

        return () => {
            isActive = false;
        };
    }, []);

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
                frontendLogger.info('✅ [Lobby] WebSocket 連線成功');
            } catch (error) {
                if (!isActive) return;
                setConnectionStatus('disconnected');
                frontendLogger.error('❌ [Lobby] WebSocket 連線失敗', {
                    error: error instanceof Error ? error.message : 'unknown'
                });
            }
        };

        if (!gameWebSocket.isConnected()) {
            connectWS();
        } else {
            setConnectionStatus('connected');
        }

        // 房間建立成功後處理
        const handleRoomCreated = (payload: any) => {
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
            frontendLogger.error('❌ [Lobby] 伺服器錯誤', {
                message: typeof payload?.message === 'string' ? payload.message : 'unknown'
            });
            setIsConnecting(false);
            alert(`錯誤: ${payload.message}`);
        };

        gameWebSocket.on('ROOM_CREATED', handleRoomCreated);
        gameWebSocket.on('PLAYER_JOINED', handlePlayerJoined);
        gameWebSocket.on('ERROR', handleError);

        return () => {
            isActive = false;
            gameWebSocket.off('ROOM_CREATED');
            gameWebSocket.off('PLAYER_JOINED');
            gameWebSocket.off('ERROR');
        };
    }, [navigate]);

    // 建立房間請求
    const createRoom = () => {
        if (!canCreateRoom) return;
        setIsConnecting(true);
        frontendLogger.diagnostic('🐞 [Lobby] 建立房間摘要', {
            playerId: playerName,
            mode: matchMode,
            aiDifficulty: matchMode === 'npc' ? aiDifficulty : undefined,
            geishaSet: selectedGeishaSet
        });
        gameWebSocket.send('CREATE_ROOM', {
            playerId: playerName,
            displayName: lineProfile?.displayName ?? playerName,
            lineUserId: lineProfile?.userId ?? localStorage.getItem('lineUserId') ?? undefined,
            avatarUrl: lineProfile?.pictureUrl ?? localStorage.getItem('lineAvatarUrl') ?? undefined,
            mode: matchMode,
            aiDifficulty: matchMode === 'npc' ? aiDifficulty : undefined,
            geishaSet: selectedGeishaSet
        });
    };

    // 加入房間請求
    const joinRoom = () => {
        if (!playerName.trim() || !roomId.trim() || connectionStatus !== 'connected') return;
        setIsConnecting(true);
        frontendLogger.diagnostic('🐞 [Lobby] 加入房間摘要', {
            roomId,
            playerId: playerName
        });
        gameWebSocket.send('JOIN_ROOM', {
            roomId,
            playerId: playerName,
            displayName: lineProfile?.displayName ?? playerName,
            lineUserId: lineProfile?.userId ?? localStorage.getItem('lineUserId') ?? undefined,
            avatarUrl: lineProfile?.pictureUrl ?? localStorage.getItem('lineAvatarUrl') ?? undefined
        });
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

    const selectedGeishaSetOption = CHARACTER_SET_OPTIONS.find((option) => option.key === selectedGeishaSet);
    const hasUnavailableCharacterSet = CHARACTER_SET_OPTIONS.some((option) => !option.available);
    const canCreateRoom = Boolean(
        playerName.trim()
        && !isConnecting
        && connectionStatus === 'connected'
        && selectedGeishaSetOption?.available
    );

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
                    <label className="form-label">對戰模式</label>
                    <div className="d-flex gap-3 mb-3">
                        <label className="form-check-label">
                            <input
                                type="radio"
                                className="form-check-input me-2"
                                name="matchMode"
                                value="online"
                                checked={matchMode === 'online'}
                                onChange={() => setMatchMode('online')}
                                disabled={isConnecting}
                            />
                            線上玩家
                        </label>
                        <label className="form-check-label">
                            <input
                                type="radio"
                                className="form-check-input me-2"
                                name="matchMode"
                                value="npc"
                                checked={matchMode === 'npc'}
                                onChange={() => setMatchMode('npc')}
                                disabled={isConnecting}
                            />
                            對戰 NPC
                        </label>
                    </div>
                    {matchMode === 'npc' && (
                        <div className="mb-3">
                            <label className="form-label">AI 強度</label>
                            <select
                                className="form-select"
                                value={aiDifficulty}
                                onChange={(event) => setAiDifficulty(event.target.value as 'easy' | 'medium' | 'hard' | 'expert' | 'hell')}
                                disabled={isConnecting}
                            >
                                <option value="easy">しぐれうい</option>
                                <option value="medium">大空スバル</option>
                                <option value="hard">兎田ぺこら</option>
                                <option value="expert">猫又おかゆ</option>
                                <option value="hell">ときのそら</option>
                            </select>
                        </div>
                    )}
                    <div className="mb-3">
                        <label className="form-label">藝妓組合</label>
                        <select
                            className="form-select"
                            value={selectedGeishaSet}
                            onChange={(event) => setSelectedGeishaSet(event.target.value as GeishaSet)}
                            disabled={isConnecting}
                            aria-label="藝妓組合"
                        >
                            {CHARACTER_SET_OPTIONS.map((option) => (
                                <option key={option.key} value={option.key} disabled={!option.available}>
                                    {option.available ? option.displayName : `${option.displayName}（目前不可用）`}
                                </option>
                            ))}
                        </select>
                        {hasUnavailableCharacterSet && (
                            <div className="form-text">不可用的藝妓組合會保留顯示，但目前無法建立房間。</div>
                        )}
                    </div>
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
                        disabled={!canCreateRoom}
                    >
                        {isConnecting ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2"></span>
                                建立中...
                            </>
                        ) : '🏠 建立房間'}
                    </button>
                </div>

                {matchMode === 'online' && (
                    <>
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
                    </>
                )}

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
