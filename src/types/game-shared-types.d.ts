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

    export type OpeningDealStep =
        | {
            type: 'BURN_HIDDEN_CARD';
            order: number;
            targetZone: 'hidden-reserve';
        }
        | {
            type: 'DEAL_CARD_BACK';
            order: number;
            targetPlayerId: string;
            cardIndex: number;
        }
        | {
            type: 'OPENING_DEAL_COMPLETE';
            order: number;
        };

    export interface OpeningDealSummary {
        sequenceId: string;
        status: 'pending' | 'completed' | 'not_replayable';
        steps: OpeningDealStep[];
        completed: boolean;
        replayable: boolean;
    }

    export type AchievementId =
        | 'first_completed_match'
        | 'first_win'
        | 'complete_3_matches'
        | 'win_3_matches';

    export type AchievementConditionType = 'completed_games' | 'wins';
    export type AchievementItemState = 'locked' | 'in_progress' | 'unlocked';
    export type AchievementStatus = 'available' | 'guest' | 'unavailable';

    export interface AchievementCatalogItem {
        achievementId: AchievementId;
        title: string;
        description: string;
        conditionType: AchievementConditionType;
        target: number;
    }

    export interface AchievementSummaryItem {
        achievementId: AchievementId;
        title: string;
        description: string;
        state: AchievementItemState;
        currentValue: number;
        target: number;
        unlockedAt?: string;
        isNew: boolean;
    }

    export interface AchievementStatusResult {
        status: AchievementStatus;
        persistenceStatus: AccountPersistenceStatus;
        message?: string;
        newUnlockCount?: number;
        items?: AchievementSummaryItem[];
        generatedAt?: string;
    }

    export interface AchievementAcknowledgeRequest {
        achievementIds?: AchievementId[];
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
        openingDeal?: OpeningDealSummary;
    }

    export interface Player {
        lineUserId?: string;
        avatarUrl?: string;
    }
}
