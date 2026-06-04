// src/pages/Lobby/index.tsx - 保存玩家ID到localStorage
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AiDifficulty, normalizeAiDifficulty } from './aiDifficultyOptions';
import LobbyBrandSurface from './LobbyBrandSurface';
import LobbyPlayControls from './LobbyPlayControls';
import LobbyHeroAside from './LobbyHeroAside';
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
                        <LobbyHeroAside
                            achievementItems={achievementItems}
                            achievementMessage={achievementMessage}
                            achievementNewUnlockCount={achievementNewUnlockCount}
                            achievementStatus={achievementStatus}
                            boundAccountProfile={boundAccountProfile}
                            accountBindingStatus={accountBindingStatus}
                            connectionStatus={connectionStatus}
                            isAchievementPanelOpen={isAchievementPanelOpen}
                            onOpenAchievements={openAchievements}
                            onBindLineAccount={bindLineAccount}
                        />
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
