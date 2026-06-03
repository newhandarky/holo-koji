// src/pages/Lobby/index.tsx - 保存玩家ID到localStorage
import React, { useEffect, useRef, useState } from 'react';
import {
    AccountSyncResult,
    AchievementStatusResult,
    CreateRoomPayload,
    ErrorPayload,
    GeishaSet,
    JoinRoomPayload,
    PlayerJoinedPayload,
    RoomCreatedPayload,
    RoomSetupMode
} from '@newhandarky/hanakoji-game-types';
import { useNavigate } from 'react-router-dom';
import { gameWebSocket } from '../../services/websocket';
import config from '../../config/environment';
import { getInviteRoomIdFromLocation, getVerifiedLineProfile } from '../../utils/lineLiff';
import {
    beginBrowserLineLogin,
    getBoundAccountProfile,
    requestAccountStatus,
    syncLineAccountWithIdToken
} from '../../utils/lineAccount';
import { acknowledgeAchievementUnlocks, requestAchievementStatus } from '../../utils/achievementAccount';
import { saveRoomSessionToken } from '../../utils/roomSession';
import { getCharacterProfilesForSet } from '../../utils/gameData';
import { frontendLogger } from '../../utils/runtimeLogger';
import { CHARACTER_SET_OPTIONS } from './characterSetOptions';
import { AiDifficulty, normalizeAiDifficulty } from './aiDifficultyOptions';
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
    const [aiDifficulty, setAiDifficulty] = useState<AiDifficulty>('easy');
    // 藝妓組合選擇（online / npc 共用）
    const [selectedGeishaSet, setSelectedGeishaSet] = useState<GeishaSet>('default');
    const [setupMode, setSetupMode] = useState<RoomSetupMode>('random');
    const [selectedCharacterIds, setSelectedCharacterIds] = useState<string[]>([]);
    // 是否正在連線或送出請求
    const [isConnecting, setIsConnecting] = useState(false);
    // 連線狀態顯示
    const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
    // LINE 使用者資料（若在 LIFF 內）
    const [accountSyncResult, setAccountSyncResult] = useState<AccountSyncResult | null>(null);
    const [accountBindingStatus, setAccountBindingStatus] = useState<'idle' | 'binding'>('idle');
    const [achievementStatus, setAchievementStatus] = useState<AchievementStatusResult | null>(null);
    const [isAchievementPanelOpen, setIsAchievementPanelOpen] = useState(false);
    const [invitedRoom, setInvitedRoom] = useState<{ roomId: string; source: 'query' | 'liff' } | null>(null);
    const [inviteRecovery, setInviteRecovery] = useState<{ roomId: string; reason: string; message: string } | null>(null);
    // 路由導向工具
    const navigate = useNavigate();
    // 最新玩家名稱（避免事件回呼讀到舊值）
    const playerNameRef = useRef('');
    const pendingJoinRoomRef = useRef<string | null>(null);
    const invitedRoomRef = useRef<{ roomId: string; source: 'query' | 'liff' } | null>(null);
    const boundAccountProfile = accountSyncResult ? getBoundAccountProfile(accountSyncResult) : null;
    const accountGuestNotice = accountSyncResult?.status === 'sync-failed' || accountSyncResult?.status === 'unverified'
        ? accountSyncResult.guestNotice
        : undefined;
    const isAccountSyncPending = accountBindingStatus === 'binding';

    // 同步最新玩家名稱到 ref，避免事件回呼讀到舊值
    useEffect(() => {
        playerNameRef.current = playerName;
    }, [playerName]);

    useEffect(() => {
        invitedRoomRef.current = invitedRoom;
    }, [invitedRoom]);

    // 若網址帶 roomId，預填加入房間欄位
    useEffect(() => {
        const { roomId: invitedRoomId, source } = getInviteRoomIdFromLocation();
        if (!invitedRoomId) return;

        const normalizedRoomId = invitedRoomId.toUpperCase();
        setRoomId(normalizedRoomId);
        setMatchMode('online');
        setInvitedRoom({ roomId: normalizedRoomId, source: source === 'liff' ? 'liff' : 'query' });
        const previousPlayerId = localStorage.getItem('currentPlayerId')?.trim();
        if (previousPlayerId) {
            setPlayerName(previousPlayerId);
        }

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

    useEffect(() => {
        if (connectionStatus !== 'connected' || isAccountSyncPending) {
            return;
        }

        let isActive = true;
        requestAchievementStatus()
            .then((result) => {
                if (!isActive) return;
                setAchievementStatus(result);
            })
            .catch((error) => {
                if (!isActive) return;
                frontendLogger.warn('⚠️ 成就狀態讀取失敗', {
                    error: error instanceof Error ? error.message : 'unknown'
                });
            });

        return () => {
            isActive = false;
        };
    }, [accountSyncResult, connectionStatus, isAccountSyncPending]);

    useEffect(() => {
        if (connectionStatus !== 'connected') {
            return;
        }

        let isActive = true;
        requestAccountStatus()
            .then((result) => {
                if (!isActive || result.status !== 'bound') return;
                setAccountSyncResult(result);
            })
            .catch(() => undefined);

        return () => {
            isActive = false;
        };
    }, [connectionStatus]);

    // 建立連線與註冊事件（只在首次掛載時執行）
    useEffect(() => {
        let isActive = true;
        const unsubscribeHandlers: Array<() => void> = [];
        const cleanupLifecycleHandlers = () => {
            while (unsubscribeHandlers.length > 0) {
                unsubscribeHandlers.pop()?.();
            }
        };

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
        const handleRoomCreated = (payload: RoomCreatedPayload) => {
            setIsConnecting(false);

            // 保存當前玩家ID到localStorage
            localStorage.setItem('currentPlayerId', playerNameRef.current);
            saveRoomSessionToken(payload.roomId, payload.playerId ?? playerNameRef.current, payload.roomSessionToken);

            cleanupLifecycleHandlers();

            navigate(`/game/${payload.roomId}`);
        };

        // 加入房間成功後處理
        const handlePlayerJoined = (payload: PlayerJoinedPayload) => {
            setIsConnecting(false);

            // 保存當前玩家ID到localStorage
            localStorage.setItem('currentPlayerId', playerNameRef.current);
            saveRoomSessionToken(payload.roomId, payload.playerId ?? playerNameRef.current, payload.roomSessionToken);

            cleanupLifecycleHandlers();

            navigate(`/game/${payload.roomId}`);
        };

        // 收到伺服器錯誤時提示使用者
        const resolveInviteRecovery = (payload: ErrorPayload) => {
            const code = typeof payload?.code === 'string' ? payload.code : '';
            const message = typeof payload?.message === 'string' ? payload.message : '無法加入房間';
            if (code === 'ROOM_NOT_FOUND' || message === '房間不存在') {
                return { reason: 'missing', message: '找不到這個邀請房間。請確認房號，或請對方重送邀請。' };
            }
            if (code === 'ROOM_FULL' || message === '房間已滿') {
                return { reason: 'full', message: '這個邀請房間已滿。請對方重送邀請，或回到大廳建立新房間。' };
            }
            if (code === 'ROOM_ALREADY_STARTED') {
                return { reason: 'started', message: '這個邀請房間已經開始對局。請對方重送邀請，或回到大廳建立新房間。' };
            }
            if (code === 'PLAYER_ID_TAKEN') {
                return { reason: 'player-id-taken', message: '這個玩家名稱已在房間中使用。請確認名稱，或改用其他名稱重新加入。' };
            }
            if (code === 'INVALID_JOIN_REQUEST' || message === '缺少 roomId 或 playerId') {
                return { reason: 'invalid', message: '這個邀請連結資料不完整。請對方重送邀請，或回到一般加入流程。' };
            }
            return { reason: 'unknown', message: '目前無法加入這個邀請房間。請對方重送邀請，或回到一般加入流程。' };
        };

        const handleError = (payload: unknown) => {
            const candidate = payload && typeof payload === 'object'
                ? payload as Partial<ErrorPayload>
                : null;
            const errorPayload: ErrorPayload = {
                message: typeof candidate?.message === 'string' ? candidate.message : '無法加入房間',
                code: typeof candidate?.code === 'string' ? candidate.code : undefined
            };
            frontendLogger.error('❌ [Lobby] 伺服器錯誤', {
                message: errorPayload.message,
                code: errorPayload.code
            });
            setIsConnecting(false);
            const pendingJoinRoom = pendingJoinRoomRef.current;
            pendingJoinRoomRef.current = null;
            if (pendingJoinRoom && invitedRoomRef.current?.roomId === pendingJoinRoom) {
                const recovery = resolveInviteRecovery(errorPayload);
                setInviteRecovery({
                    roomId: pendingJoinRoom,
                    reason: recovery.reason,
                    message: recovery.message
                });
                return;
            }

            alert(`錯誤: ${errorPayload.message}`);
        };

        unsubscribeHandlers.push(gameWebSocket.on('ROOM_CREATED', handleRoomCreated));
        unsubscribeHandlers.push(gameWebSocket.on('PLAYER_JOINED', handlePlayerJoined));
        unsubscribeHandlers.push(gameWebSocket.on('ERROR', handleError));

        return () => {
            isActive = false;
            cleanupLifecycleHandlers();
        };
    }, [navigate]);

    // 建立房間請求
    const createRoom = () => {
        if (!canCreateRoom) return;
        setIsConnecting(true);
        const normalizedAiDifficulty = normalizeAiDifficulty(aiDifficulty);
        const customSelection = setupMode === 'custom'
            ? { characterIds: selectedCharacterIds }
            : undefined;
        frontendLogger.diagnostic('🐞 [Lobby] 建立房間摘要', {
            playerId: playerName,
            mode: matchMode,
            aiDifficulty: matchMode === 'npc' ? normalizedAiDifficulty : undefined,
            geishaSet: selectedGeishaSet,
            setupMode
        });
        const createPayload: CreateRoomPayload = {
            playerId: playerName,
            displayName: playerName,
            lineUserId: boundAccountProfile?.lineUserId,
            avatarUrl: boundAccountProfile?.avatarUrl,
            mode: matchMode,
            aiDifficulty: matchMode === 'npc' ? normalizedAiDifficulty : undefined,
            geishaSet: selectedGeishaSet,
            setupMode,
            ...(customSelection ? { customSelection } : {})
        };
        gameWebSocket.send('CREATE_ROOM', createPayload);
    };

    // 加入房間請求
    const joinRoom = () => {
        if (!playerName.trim() || !roomId.trim() || connectionStatus !== 'connected') return;
        setIsConnecting(true);
        pendingJoinRoomRef.current = roomId;
        setInviteRecovery(null);
        frontendLogger.diagnostic('🐞 [Lobby] 加入房間摘要', {
            roomId,
            playerId: playerName
        });
        const joinPayload: JoinRoomPayload = {
            roomId,
            playerId: playerName,
            displayName: playerName,
            lineUserId: boundAccountProfile?.lineUserId,
            avatarUrl: boundAccountProfile?.avatarUrl
        };
        gameWebSocket.send('JOIN_ROOM', joinPayload);
    };

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

    const achievementItems = achievementStatus?.items ?? [];
    const achievementNewUnlockCount = achievementStatus?.newUnlockCount ?? 0;
    const achievementMessage = achievementStatus?.message;

    const openAchievements = () => {
        setIsAchievementPanelOpen((current) => !current);
        if (achievementNewUnlockCount <= 0 || !achievementItems.some((item) => item.isNew)) {
            return;
        }

        acknowledgeAchievementUnlocks({
            achievementIds: achievementItems.filter((item) => item.isNew).map((item) => item.achievementId)
        })
            .then(setAchievementStatus)
            .catch((error) => {
                frontendLogger.warn('⚠️ 成就提示清除失敗', {
                    error: error instanceof Error ? error.message : 'unknown'
                });
            });
    };

    const bindLineAccount = async () => {
        if (accountBindingStatus === 'binding' || boundAccountProfile) {
            return;
        }

        setAccountBindingStatus('binding');

        try {
            const verifiedLineProfile = await getVerifiedLineProfile();
            if (!verifiedLineProfile) {
                beginBrowserLineLogin();
                return;
            }

            const result = await syncLineAccountWithIdToken(
                verifiedLineProfile.profile,
                verifiedLineProfile.idToken
            );
            setAccountSyncResult(result);
            if (!playerNameRef.current && result.profile?.displayName) {
                setPlayerName(result.profile.displayName);
            }
        } catch (error) {
            frontendLogger.warn('⚠️ LINE 帳號綁定失敗', {
                error: error instanceof Error ? error.message : 'unknown'
            });
            setAccountSyncResult({
                status: 'sync-failed',
                guestNotice: 'LINE 帳號綁定失敗，請稍後再試。',
                persistenceStatus: {
                    mode: 'temporary',
                    available: true,
                    message: 'Account profiles are temporary in this environment.'
                }
            });
        } finally {
            setAccountBindingStatus('idle');
        }
    };

    const invitedRoomNotice = invitedRoom
        ? `已從邀請連結帶入房間 ${invitedRoom.roomId}，確認玩家名稱後再加入。`
        : undefined;

    const copyInviteRoomId = async () => {
        if (!inviteRecovery?.roomId) return;
        try {
            await navigator.clipboard.writeText(inviteRecovery.roomId);
        } catch {
            const textArea = document.createElement('textarea');
            textArea.value = inviteRecovery.roomId;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
        }
    };

    const clearInviteRecovery = () => {
        setInviteRecovery(null);
    };

    return (
        <div className="lobby-background">
            <div className="container-fluid px-3 px-md-4 py-4 py-md-5">
                <LobbyBrandSurface
                    onOpenDiagnostics={() => navigate('/diagnostics')}
                    heroAside={(
                        <>
                            <section className="lobby-achievements" aria-label="成就">
                                <button
                                    type="button"
                                    className="lobby-achievements__entry"
                                    onClick={openAchievements}
                                    aria-expanded={isAchievementPanelOpen}
                                >
                                    <span>
                                        <span className="lobby-achievements__kicker">Achievements</span>
                                        <span className="lobby-achievements__title">成就</span>
                                    </span>
                                    {achievementNewUnlockCount > 0 && (
                                        <span className="lobby-achievements__badge">新解鎖 {achievementNewUnlockCount}</span>
                                    )}
                                </button>

                                {isAchievementPanelOpen && (
                                    <div className="lobby-achievements__panel">
                                        {achievementStatus?.status === 'available' && achievementItems.length > 0 ? (
                                            <div className="lobby-achievements__list">
                                                {achievementItems.map((item) => (
                                                    <div key={item.achievementId} className={`lobby-achievement-item lobby-achievement-item--${item.state}`}>
                                                        <div>
                                                            <div className="lobby-achievement-item__title">
                                                                {item.title}
                                                                {item.isNew && <span className="lobby-achievement-item__new">新</span>}
                                                            </div>
                                                            <div className="lobby-achievement-item__description">{item.description}</div>
                                                        </div>
                                                        <div className="lobby-achievement-item__progress">
                                                            {item.currentValue} / {item.target}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="lobby-achievements__empty" role="status">
                                                {achievementMessage ?? '成就狀態讀取中。'}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </section>

                            <section className="lobby-account-card" aria-label="LINE 帳號">
                                <div>
                                    <div className="lobby-account-card__kicker">LINE Account</div>
                                    <div className="lobby-account-card__title">LINE 帳號</div>
                                    <div className="lobby-account-card__message">
                                        {boundAccountProfile
                                            ? `已綁定：${boundAccountProfile.displayName}`
                                            : '綁定後可保存成就與對局紀錄。'}
                                    </div>
                                </div>
                                {!boundAccountProfile && (
                                    <button
                                        type="button"
                                        className="btn btn-outline-light lobby-account-card__button"
                                        onClick={bindLineAccount}
                                        disabled={accountBindingStatus === 'binding' || connectionStatus !== 'connected'}
                                    >
                                        {accountBindingStatus === 'binding' ? '綁定中...' : '綁定 LINE 帳號'}
                                    </button>
                                )}
                            </section>

                            <div className="lobby-copy-note">
                                <strong>遊戲說明：</strong>
                                <span>透過四種行動收集物品卡，獲得女公關的好感。控制四位以上女公關或累積 11 點魅力值即可獲勝。</span>
                            </div>
                        </>
                    )}
                >
                    <LobbyPlayControls
                        playerName={playerName}
                        roomId={roomId}
                        matchMode={matchMode}
                        aiDifficulty={normalizeAiDifficulty(aiDifficulty)}
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
                        invitedRoomNotice={invitedRoomNotice}
                        inviteRecovery={inviteRecovery}
                        onPlayerNameChange={setPlayerName}
                        onRoomIdChange={setRoomId}
                        onMatchModeChange={setMatchMode}
                        onAiDifficultyChange={setAiDifficulty}
                        onGeishaSetChange={handleGeishaSetChange}
                        onSetupModeChange={handleSetupModeChange}
                        onCharacterSelectionToggle={toggleCharacterSelection}
                        onCopyInviteRoomId={copyInviteRoomId}
                        onClearInviteRecovery={clearInviteRecovery}
                        onCreateRoom={createRoom}
                        onJoinRoom={joinRoom}
                    />
                </LobbyBrandSurface>
            </div>
        </div>
    );
};

export default Lobby;
