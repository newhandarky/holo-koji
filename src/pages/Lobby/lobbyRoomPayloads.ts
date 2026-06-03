import {
    CreateRoomPayload,
    GeishaSet,
    JoinRoomPayload,
    LineAccountProfile,
    RoomSetupMode
} from '@newhandarky/hanakoji-game-types';
import { AiDifficulty, normalizeAiDifficulty } from './aiDifficultyOptions';

interface BuildCreateRoomPayloadOptions {
    playerName: string;
    matchMode: 'online' | 'npc';
    aiDifficulty: AiDifficulty;
    selectedGeishaSet: GeishaSet;
    setupMode: RoomSetupMode;
    selectedCharacterIds: string[];
    boundAccountProfile: LineAccountProfile | null;
}

interface BuildJoinRoomPayloadOptions {
    roomId: string;
    playerName: string;
    boundAccountProfile: LineAccountProfile | null;
}

export const isCustomSelectionReady = (setupMode: RoomSetupMode, selectedCharacterIds: string[]): boolean => (
    setupMode !== 'custom' || selectedCharacterIds.length === 7
);

export const buildCreateRoomPayload = ({
    playerName,
    matchMode,
    aiDifficulty,
    selectedGeishaSet,
    setupMode,
    selectedCharacterIds,
    boundAccountProfile
}: BuildCreateRoomPayloadOptions): CreateRoomPayload => {
    const normalizedAiDifficulty = normalizeAiDifficulty(aiDifficulty);
    const customSelection = setupMode === 'custom'
        ? { characterIds: selectedCharacterIds }
        : undefined;

    return {
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
};

export const buildJoinRoomPayload = ({
    roomId,
    playerName,
    boundAccountProfile
}: BuildJoinRoomPayloadOptions): JoinRoomPayload => ({
    roomId,
    playerId: playerName,
    displayName: playerName,
    lineUserId: boundAccountProfile?.lineUserId,
    avatarUrl: boundAccountProfile?.avatarUrl
});
