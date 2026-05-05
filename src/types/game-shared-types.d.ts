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

    export interface VerifiedLineIdentity {
        provider: 'line';
        lineUserId: string;
        verifiedAt: string;
        source: string;
    }

    export interface MinimalAccountCounters {
        gamesPlayed: number;
        wins: number;
        lastPlayedAt: string | null;
    }

    export interface LineAccountProfile {
        lineUserId: string;
        displayName: string;
        avatarUrl?: string;
        createdAt: string;
        updatedAt: string;
        counters: MinimalAccountCounters;
    }

    export interface AccountPersistenceStatus {
        mode: 'durable' | 'temporary';
        available: boolean;
        message: string;
    }

    export type AccountSyncStatus = 'bound' | 'guest' | 'sync-failed' | 'unverified';

    export interface AccountSyncResult {
        status: AccountSyncStatus;
        profile?: LineAccountProfile;
        persistenceStatus: AccountPersistenceStatus;
        guestNotice?: string;
    }

    export interface AccountSyncRequest {
        verifiedIdentity?: VerifiedLineIdentity;
        profile?: {
            displayName?: string;
            avatarUrl?: string;
        };
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
