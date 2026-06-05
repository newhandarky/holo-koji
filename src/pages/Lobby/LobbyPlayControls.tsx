import React from 'react';
import { CharacterProfile, GeishaSet, RoomSetupMode } from '@newhandarky/hanakoji-game-types';
import { AiDifficulty } from './aiDifficultyOptions';
import {
    LobbyCharacterSetupSection,
    LobbyCreateRoomSection,
    LobbyJoinRoomSection,
    LobbyMatchModeSection,
    LobbyNoticeSection
} from './LobbyPlayControlSections';

interface LobbyPlayControlsProps {
    playerName: string;
    roomId: string;
    matchMode: 'online' | 'npc';
    aiDifficulty: AiDifficulty;
    selectedGeishaSet: GeishaSet;
    setupMode: RoomSetupMode;
    availableCharacterProfiles: CharacterProfile[];
    selectedCharacterIds: string[];
    customSelectionCount: number;
    isConnecting: boolean;
    canCreateRoom: boolean;
    canJoinRoom: boolean;
    hasUnavailableCharacterSet: boolean;
    accountGuestNotice?: string;
    invitedRoomNotice?: string;
    inviteRecovery?: {
        roomId: string;
        message: string;
    } | null;
    onPlayerNameChange: (value: string) => void;
    onRoomIdChange: (value: string) => void;
    onMatchModeChange: (value: 'online' | 'npc') => void;
    onAiDifficultyChange: (value: AiDifficulty) => void;
    onGeishaSetChange: (value: GeishaSet) => void;
    onSetupModeChange: (value: RoomSetupMode) => void;
    onCharacterSelectionToggle: (characterId: string) => void;
    onCopyInviteRoomId: () => void;
    onClearInviteRecovery: () => void;
    onCreateRoom: () => void;
    onJoinRoom: () => void;
}

const LobbyPlayControls: React.FC<LobbyPlayControlsProps> = ({
    playerName,
    roomId,
    matchMode,
    aiDifficulty,
    selectedGeishaSet,
    setupMode,
    availableCharacterProfiles,
    selectedCharacterIds,
    customSelectionCount,
    isConnecting,
    canCreateRoom,
    canJoinRoom,
    hasUnavailableCharacterSet,
    accountGuestNotice,
    invitedRoomNotice,
    inviteRecovery,
    onPlayerNameChange,
    onRoomIdChange,
    onMatchModeChange,
    onAiDifficultyChange,
    onGeishaSetChange,
    onSetupModeChange,
    onCharacterSelectionToggle,
    onCopyInviteRoomId,
    onClearInviteRecovery,
    onCreateRoom,
    onJoinRoom
}) => {
    return (
    <div className="lobby-controls">
        <div className="lobby-controls__heading">
            <div>
                <div className="lobby-controls__kicker">Lobby</div>
                <h2 className="lobby-controls__title">選擇你的入場方式</h2>
            </div>
        </div>

        <div className="lobby-form-block">
            <LobbyNoticeSection
                accountGuestNotice={accountGuestNotice}
                invitedRoomNotice={invitedRoomNotice}
                inviteRecovery={inviteRecovery}
                onCopyInviteRoomId={onCopyInviteRoomId}
                onClearInviteRecovery={onClearInviteRecovery}
            />

            <LobbyMatchModeSection
                matchMode={matchMode}
                aiDifficulty={aiDifficulty}
                isConnecting={isConnecting}
                onMatchModeChange={onMatchModeChange}
                onAiDifficultyChange={onAiDifficultyChange}
            />

            <LobbyCharacterSetupSection
                selectedGeishaSet={selectedGeishaSet}
                setupMode={setupMode}
                availableCharacterProfiles={availableCharacterProfiles}
                selectedCharacterIds={selectedCharacterIds}
                customSelectionCount={customSelectionCount}
                isConnecting={isConnecting}
                hasUnavailableCharacterSet={hasUnavailableCharacterSet}
                onGeishaSetChange={onGeishaSetChange}
                onSetupModeChange={onSetupModeChange}
                onCharacterSelectionToggle={onCharacterSelectionToggle}
            />

            <LobbyCreateRoomSection
                playerName={playerName}
                isConnecting={isConnecting}
                canCreateRoom={canCreateRoom}
                onPlayerNameChange={onPlayerNameChange}
                onCreateRoom={onCreateRoom}
            />
        </div>

        <LobbyJoinRoomSection
            roomId={roomId}
            matchMode={matchMode}
            isConnecting={isConnecting}
            canJoinRoom={canJoinRoom}
            onRoomIdChange={onRoomIdChange}
            onJoinRoom={onJoinRoom}
        />
    </div>
    );
};

export default LobbyPlayControls;
