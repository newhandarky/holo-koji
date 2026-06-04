// src/pages/Lobby/index.tsx - 保存玩家ID到localStorage
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AiDifficulty, normalizeAiDifficulty } from './aiDifficultyOptions';
import LobbyBrandSurface from './LobbyBrandSurface';
import LobbyPlayControls from './LobbyPlayControls';
import {
    buildInvitedRoomNotice,
    copyTextWithTextareaFallback,
    InvitedRoom,
    InviteRecoveryNotice
} from './lobbyInviteFlow';
import { useLobbyAccountAchievements } from './useLobbyAccountAchievements';
import { useLobbyRoomLifecycle } from './useLobbyRoomLifecycle';
import { useLobbyInviteBootstrap } from './useLobbyInviteBootstrap';
import { useLobbyCustomSelection } from './useLobbyCustomSelection';
import { useLobbyRoomCommands } from './useLobbyRoomCommands';

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
        selectedGeishaSet,
        setupMode,
        selectedCharacterIds,
        selectedGeishaSetOption,
        hasUnavailableCharacterSet,
        availableCharacterProfiles,
        customSelectionCount,
        customSelectionIsReady,
        handleGeishaSetChange,
        handleSetupModeChange,
        toggleCharacterSelection
    } = useLobbyCustomSelection();
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

    useLobbyInviteBootstrap({
        setRoomId,
        setMatchMode,
        setInvitedRoom,
        setPlayerName
    });

    useLobbyRoomLifecycle({
        navigate,
        playerNameRef,
        invitedRoomRef,
        pendingJoinRoomRef,
        setConnectionStatus,
        setInviteRecovery,
        setIsConnecting
    });

    const {
        canCreateRoom,
        canJoinRoom,
        createRoom,
        joinRoom
    } = useLobbyRoomCommands({
        playerName,
        roomId,
        matchMode,
        aiDifficulty,
        selectedGeishaSet,
        setupMode,
        selectedCharacterIds,
        selectedGeishaSetAvailable: Boolean(selectedGeishaSetOption?.available),
        customSelectionIsReady,
        isConnecting,
        isAccountSyncPending,
        connectionStatus,
        boundAccountProfile,
        pendingJoinRoomRef,
        setIsConnecting,
        setInviteRecovery
    });

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
