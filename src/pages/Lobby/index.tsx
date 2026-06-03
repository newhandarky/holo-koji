// src/pages/Lobby/index.tsx - 保存玩家ID到localStorage
import React, { useEffect, useRef, useState } from 'react';
import {
    GeishaSet,
    RoomSetupMode
} from '@newhandarky/hanakoji-game-types';
import { useNavigate } from 'react-router-dom';
import { gameWebSocket } from '../../services/websocket';
import { getInviteRoomIdFromLocation } from '../../utils/lineLiff';
import { getCharacterProfilesForSet } from '../../utils/gameData';
import { frontendLogger } from '../../utils/runtimeLogger';
import { CHARACTER_SET_OPTIONS } from './characterSetOptions';
import { AiDifficulty, normalizeAiDifficulty } from './aiDifficultyOptions';
import LobbyBrandSurface from './LobbyBrandSurface';
import LobbyPlayControls from './LobbyPlayControls';
import {
    buildInvitedRoomNotice,
    copyTextWithTextareaFallback,
    InvitedRoom,
    InviteRecoveryNotice
} from './lobbyInviteFlow';
import { buildCreateRoomPayload, buildJoinRoomPayload, isCustomSelectionReady } from './lobbyRoomPayloads';
import { useLobbyAccountAchievements } from './useLobbyAccountAchievements';
import { useLobbyRoomLifecycle } from './useLobbyRoomLifecycle';

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
    const [invitedRoom, setInvitedRoom] = useState<InvitedRoom | null>(null);
    const [inviteRecovery, setInviteRecovery] = useState<InviteRecoveryNotice | null>(null);
    // 路由導向工具
    const navigate = useNavigate();
    // 最新玩家名稱（避免事件回呼讀到舊值）
    const playerNameRef = useRef('');
    const pendingJoinRoomRef = useRef<string | null>(null);
    const invitedRoomRef = useRef<InvitedRoom | null>(null);
    const {
        accountBindingStatus,
        accountGuestNotice,
        achievementItems,
        achievementMessage,
        achievementNewUnlockCount,
        achievementStatus,
        bindLineAccount,
        boundAccountProfile,
        isAchievementPanelOpen,
        isAccountSyncPending,
        openAchievements
    } = useLobbyAccountAchievements({
        connectionStatus,
        playerNameRef,
        setPlayerName
    });

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

    useLobbyRoomLifecycle({
        navigate,
        playerNameRef,
        invitedRoomRef,
        pendingJoinRoomRef,
        setConnectionStatus,
        setInviteRecovery,
        setIsConnecting
    });

    // 建立房間請求
    const createRoom = () => {
        if (!canCreateRoom) return;
        setIsConnecting(true);
        const normalizedAiDifficulty = normalizeAiDifficulty(aiDifficulty);
        frontendLogger.diagnostic('🐞 [Lobby] 建立房間摘要', {
            playerId: playerName,
            mode: matchMode,
            aiDifficulty: matchMode === 'npc' ? normalizedAiDifficulty : undefined,
            geishaSet: selectedGeishaSet,
            setupMode
        });
        const createPayload = buildCreateRoomPayload({
            playerName,
            matchMode,
            aiDifficulty,
            selectedGeishaSet,
            setupMode,
            selectedCharacterIds,
            boundAccountProfile
        });
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
        const joinPayload = buildJoinRoomPayload({
            roomId,
            playerName,
            boundAccountProfile
        });
        gameWebSocket.send('JOIN_ROOM', joinPayload);
    };

    const selectedGeishaSetOption = CHARACTER_SET_OPTIONS.find((option) => option.key === selectedGeishaSet);
    const hasUnavailableCharacterSet = CHARACTER_SET_OPTIONS.some((option) => !option.available);
    const availableCharacterProfiles = getCharacterProfilesForSet(selectedGeishaSet);
    const customSelectionCount = selectedCharacterIds.length;
    const customSelectionIsReady = isCustomSelectionReady(setupMode, selectedCharacterIds);
    const canCreateRoom = Boolean(
        playerName.trim()
        && !isConnecting
        && !isAccountSyncPending
        && connectionStatus === 'connected'
        && selectedGeishaSetOption?.available
        && customSelectionIsReady
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

    const invitedRoomNotice = buildInvitedRoomNotice(invitedRoom);

    const copyInviteRoomId = async () => {
        if (!inviteRecovery?.roomId) return;
        await copyTextWithTextareaFallback(inviteRecovery.roomId);
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
