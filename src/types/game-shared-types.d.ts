import 'game-shared-types';

declare module 'game-shared-types' {
    export type GeishaSetKey = 'default' | 'collaboration' | 'hololive';
    export type RoomSetupMode = 'random' | 'custom';

    export interface CharacterProfile {
        characterId: string;
        name: string;
        imageUrl: string;
    }

    export const characterProfilesBySet: Record<GeishaSetKey, CharacterProfile[]>;

    export interface CustomCharacterSelection {
        characterIds: string[];
    }

    export interface CreateRoomPayload {
        playerId: string;
        displayName?: string;
        lineUserId?: string;
        avatarUrl?: string;
        mode?: 'online' | 'npc';
        aiDifficulty?: 'easy' | 'medium' | 'hard' | 'expert' | 'hell';
        geishaSet?: GeishaSetKey;
        setupMode?: RoomSetupMode;
        customSelection?: CustomCharacterSelection;
    }

    export interface GameState {
        geishaSet?: GeishaSetKey;
    }

    export interface Player {
        lineUserId?: string;
        avatarUrl?: string;
    }
}
