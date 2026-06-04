import { useCallback } from 'react';
import type { Dispatch, MutableRefObject, SetStateAction } from 'react';
import type { GeishaSet, LineAccountProfile, RoomSetupMode } from '@newhandarky/hanakoji-game-types';
import { gameWebSocket } from '../../services/websocket';
import { frontendLogger } from '../../utils/runtimeLogger';
import { AiDifficulty, normalizeAiDifficulty } from './aiDifficultyOptions';
import { buildCreateRoomPayload, buildJoinRoomPayload } from './lobbyRoomPayloads';
import type { InviteRecoveryNotice } from './lobbyInviteFlow';

interface UseLobbyRoomCommandsOptions {
    playerName: string;
    roomId: string;
    matchMode: 'online' | 'npc';
    aiDifficulty: AiDifficulty;
    selectedGeishaSet: GeishaSet;
    setupMode: RoomSetupMode;
    selectedCharacterIds: string[];
    selectedGeishaSetAvailable: boolean;
    customSelectionIsReady: boolean;
    isConnecting: boolean;
    isAccountSyncPending: boolean;
    connectionStatus: 'disconnected' | 'connecting' | 'connected';
    boundAccountProfile: LineAccountProfile | null;
    pendingJoinRoomRef: MutableRefObject<string | null>;
    setIsConnecting: Dispatch<SetStateAction<boolean>>;
    setInviteRecovery: Dispatch<SetStateAction<InviteRecoveryNotice | null>>;
}

export const useLobbyRoomCommands = ({
    playerName,
    roomId,
    matchMode,
    aiDifficulty,
    selectedGeishaSet,
    setupMode,
    selectedCharacterIds,
    selectedGeishaSetAvailable,
    customSelectionIsReady,
    isConnecting,
    isAccountSyncPending,
    connectionStatus,
    boundAccountProfile,
    pendingJoinRoomRef,
    setIsConnecting,
    setInviteRecovery
}: UseLobbyRoomCommandsOptions) => {
    const canCreateRoom = Boolean(
        playerName.trim()
        && !isConnecting
        && !isAccountSyncPending
        && connectionStatus === 'connected'
        && selectedGeishaSetAvailable
        && customSelectionIsReady
    );
    const canJoinRoom = Boolean(
        playerName.trim()
        && roomId.trim()
        && !isConnecting
        && !isAccountSyncPending
        && connectionStatus === 'connected'
    );

    const createRoom = useCallback(() => {
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
    }, [
        aiDifficulty,
        boundAccountProfile,
        canCreateRoom,
        matchMode,
        playerName,
        selectedCharacterIds,
        selectedGeishaSet,
        setIsConnecting,
        setupMode
    ]);

    const joinRoom = useCallback(() => {
        if (!canJoinRoom) return;
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
    }, [
        boundAccountProfile,
        canJoinRoom,
        pendingJoinRoomRef,
        playerName,
        roomId,
        setInviteRecovery,
        setIsConnecting
    ]);

    return {
        canCreateRoom,
        canJoinRoom,
        createRoom,
        joinRoom
    };
};
