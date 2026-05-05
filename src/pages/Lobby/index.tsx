// src/pages/Lobby/index.tsx - 保存玩家ID到localStorage
import React, { useEffect, useRef, useState } from 'react';
import { AccountSyncResult, GeishaSet, RoomSetupMode } from 'game-shared-types';
import { useNavigate } from 'react-router-dom';
import { gameWebSocket } from '../../services/websocket';
import config from '../../config/environment';
import { getInviteRoomIdFromLocation, getLineProfile, LineProfile } from '../../utils/lineLiff';
import { getBoundAccountProfile, syncLineAccount } from '../../utils/lineAccount';
import { getCharacterProfilesForSet } from '../../utils/gameData';
import { frontendLogger } from '../../utils/runtimeLogger';
import { CHARACTER_SET_OPTIONS } from './characterSetOptions';
import LobbyBrandSurface from './LobbyBrandSurface';
import LobbyPlayControls from './LobbyPlayControls';

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
    const [setupMode, setSetupMode] = useState<RoomSetupMode>('random');
    const [selectedCharacterIds, setSelectedCharacterIds] = useState<string[]>([]);
    // 是否正在連線或送出請求
    const [isConnecting, setIsConnecting] = useState(false);
    // 連線狀態顯示
    const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
    // LINE 使用者資料（若在 LIFF 內）
    const [lineProfile, setLineProfile] = useState<LineProfile | null>(null);
    const [accountSyncResult, setAccountSyncResult] = useState<AccountSyncResult | null>(null);
    // 路由導向工具
    const navigate = useNavigate();
    // 最新玩家名稱（避免事件回呼讀到舊值）
    const playerNameRef = useRef('');
    const accountSyncStartedRef = useRef(false);

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

    useEffect(() => {
        if (setupMode !== 'custom') {
            setSelectedCharacterIds([]);
            return;
        }

        const profiles = getCharacterProfilesForSet(selectedGeishaSet);
        setSelectedCharacterIds((currentIds) => {
            if (profiles.length === 7) {
                return profiles.map((profile) => profile.characterId);
            }

            const validIds = new Set(profiles.map((profile) => profile.characterId));
            return currentIds.filter((characterId) => validIds.has(characterId));
        });
    }, [selectedGeishaSet, setupMode]);

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
                setAccountSyncResult({
                    status: 'sync-failed',
                    guestNotice: '目前以訪客模式繼續，帳號進度暫時不會保存。',
                    persistenceStatus: {
                        mode: 'temporary',
                        available: true,
                        message: 'Account profiles are temporary in this environment.'
                    }
                });
            }
        };

        loadLineProfile();

        return () => {
            isActive = false;
        };
    }, []);

    useEffect(() => {
        if (!lineProfile || connectionStatus !== 'connected' || accountSyncStartedRef.current) {
            return;
        }

        let isActive = true;
        accountSyncStartedRef.current = true;

        syncLineAccount(lineProfile)
            .then((syncResult) => {
                if (!isActive) return;
                setAccountSyncResult(syncResult);
            })
            .catch((error) => {
                if (!isActive) return;
                frontendLogger.warn('⚠️ LINE 帳號同步失敗', {
                    error: error instanceof Error ? error.message : 'unknown'
                });
                setAccountSyncResult({
                    status: 'sync-failed',
                    guestNotice: '目前以訪客模式繼續，帳號進度暫時不會保存。',
                    persistenceStatus: {
                        mode: 'temporary',
                        available: true,
                        message: 'Account profiles are temporary in this environment.'
                    }
                });
            });

        return () => {
            isActive = false;
        };
    }, [connectionStatus, lineProfile]);

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
        const customSelection = setupMode === 'custom'
            ? { characterIds: selectedCharacterIds }
            : undefined;
        frontendLogger.diagnostic('🐞 [Lobby] 建立房間摘要', {
            playerId: playerName,
            mode: matchMode,
            aiDifficulty: matchMode === 'npc' ? aiDifficulty : undefined,
            geishaSet: selectedGeishaSet,
            setupMode
        });
        gameWebSocket.send('CREATE_ROOM', {
            playerId: playerName,
            displayName: playerName,
            lineUserId: boundAccountProfile?.lineUserId,
            avatarUrl: boundAccountProfile?.avatarUrl,
            mode: matchMode,
            aiDifficulty: matchMode === 'npc' ? aiDifficulty : undefined,
            geishaSet: selectedGeishaSet,
            setupMode,
            ...(customSelection ? { customSelection } : {})
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
            displayName: playerName,
            lineUserId: boundAccountProfile?.lineUserId,
            avatarUrl: boundAccountProfile?.avatarUrl
        });
    };

    const boundAccountProfile = accountSyncResult ? getBoundAccountProfile(accountSyncResult) : null;
    const accountGuestNotice = accountSyncResult?.status === 'sync-failed' || accountSyncResult?.status === 'unverified'
        ? accountSyncResult.guestNotice
        : undefined;
    const isAccountSyncPending = Boolean(lineProfile && !accountSyncResult);
    const selectedGeishaSetOption = CHARACTER_SET_OPTIONS.find((option) => option.key === selectedGeishaSet);
    const hasUnavailableCharacterSet = CHARACTER_SET_OPTIONS.some((option) => !option.available);
    const availableCharacterProfiles = getCharacterProfilesForSet(selectedGeishaSet);
    const customSelectionCount = selectedCharacterIds.length;
    const isCustomSelectionReady = setupMode !== 'custom' || customSelectionCount === 7;
    const canCreateRoom = Boolean(
        playerName.trim()
        && !isConnecting
        && !isAccountSyncPending
        && connectionStatus === 'connected'
        && selectedGeishaSetOption?.available
        && isCustomSelectionReady
    );
    const canJoinRoom = Boolean(
        playerName.trim()
        && roomId.trim()
        && !isConnecting
        && !isAccountSyncPending
        && connectionStatus === 'connected'
    );

    const handleGeishaSetChange = (value: GeishaSet) => {
        setSelectedGeishaSet(value);
    };

    const handleSetupModeChange = (value: RoomSetupMode) => {
        setSetupMode(value);
    };

    const toggleCharacterSelection = (characterId: string) => {
        setSelectedCharacterIds((currentIds) => {
            if (currentIds.includes(characterId)) {
                return currentIds.filter((id) => id !== characterId);
            }
            return [...currentIds, characterId];
        });
    };

    return (
        <div className="lobby-background">
            <div className="container-fluid px-3 px-md-4 py-4 py-md-5">
                <LobbyBrandSurface onOpenDiagnostics={() => navigate('/diagnostics')}>
                    <LobbyPlayControls
                        playerName={playerName}
                        roomId={roomId}
                        matchMode={matchMode}
                        aiDifficulty={aiDifficulty}
                        selectedGeishaSet={selectedGeishaSet}
                        setupMode={setupMode}
                        availableCharacterProfiles={availableCharacterProfiles}
                        selectedCharacterIds={selectedCharacterIds}
                        customSelectionCount={customSelectionCount}
                        isConnecting={isConnecting}
                        canCreateRoom={canCreateRoom}
                        canJoinRoom={canJoinRoom}
                        hasUnavailableCharacterSet={hasUnavailableCharacterSet}
                        accountGuestNotice={accountGuestNotice}
                        onPlayerNameChange={setPlayerName}
                        onRoomIdChange={setRoomId}
                        onMatchModeChange={setMatchMode}
                        onAiDifficultyChange={setAiDifficulty}
                        onGeishaSetChange={handleGeishaSetChange}
                        onSetupModeChange={handleSetupModeChange}
                        onCharacterSelectionToggle={toggleCharacterSelection}
                        onCreateRoom={createRoom}
                        onJoinRoom={joinRoom}
                    />
                </LobbyBrandSurface>
            </div>
        </div>
    );
};

export default Lobby;
