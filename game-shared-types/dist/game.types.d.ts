export type PlayerId = 'player1' | 'player2';
export interface Geisha {
    id: number;
    characterId?: string;
    boardSlotId?: number;
    name: string;
    charmPoints: number;
    imageUrl: string;
    controlledBy: PlayerId | null;
}
export interface ItemCard {
    id: string;
    geishaId: number;
    type: string;
    boardSlotId?: number;
    itemAssetName?: string;
    itemLabel?: string;
    itemImageUrl?: string;
    itemIconUrl?: string;
}
export type ActionType = 'secret' | 'trade-off' | 'gift' | 'competition';
export type GamePhase = 'waiting' | 'deciding_order' | 'playing' | 'resolution' | 'ended';
export interface ActionToken {
    type: ActionType;
    used: boolean;
}
export interface Player {
    id: string;
    name: string;
    lineUserId?: string;
    avatarUrl?: string;
    hand: ItemCard[];
    playedCards: ItemCard[];
    secretCards: ItemCard[];
    discardedCards: ItemCard[];
    actionTokens: ActionToken[];
    score: {
        charm: number;
        tokens: number;
    };
}
export interface PendingGiftInteraction {
    type: 'GIFT_SELECTION';
    initiatorId: string;
    targetPlayerId: string;
    offeredCards?: ItemCard[];
}
export interface PendingCompetitionInteraction {
    type: 'COMPETITION_SELECTION';
    initiatorId: string;
    targetPlayerId: string;
    groups?: ItemCard[][];
}
export type PendingInteraction = PendingGiftInteraction | PendingCompetitionInteraction;
export interface OrderDecision {
    isOpen: boolean;
    phase: 'deciding' | 'result' | 'waiting_confirmation';
    players: string[];
    result?: {
        firstPlayer: string;
        secondPlayer: string;
        order: string[];
    };
    confirmations: string[];
    waitingFor: string[];
    currentPlayer: string;
}
export type GeishaSet = 'default' | 'collaboration' | 'hololive';
export type RoomSetupMode = 'random' | 'custom';
export interface CharacterProfile {
    characterId: string;
    name: string;
    imageUrl: string;
}
export declare const characterProfilesBySet: Record<GeishaSet, CharacterProfile[]>;
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
    geishaSet?: GeishaSet;
    setupMode?: RoomSetupMode;
    customSelection?: CustomCharacterSelection;
}
export interface GameState {
    gameId: string;
    players: Player[];
    geishas: Geisha[];
    geishaSet?: GeishaSet;
    currentPlayer: number;
    phase: GamePhase;
    round: number;
    winner?: string;
    orderDecision: OrderDecision;
    drawPile: ItemCard[];
    discardPile: ItemCard[];
    removedCard?: ItemCard;
    pendingInteraction: PendingInteraction | null;
    lastAction?: {
        playerId: string;
        action: ActionType;
    };
}
export type GameAction = {
    type: 'INIT_GAME';
    payload: {
        gameId: string;
        players: Player[];
    };
} | {
    type: 'DRAW_CARD';
    payload: {
        playerId: string;
        card: ItemCard;
    };
} | {
    type: 'PLAY_ACTION';
    payload: {
        playerId: string;
        action: ActionToken;
        cards: ItemCard[];
    };
} | {
    type: 'SCORE_ROUND';
    payload: {
        scores: {
            playerId: string;
            points: number;
        }[];
    };
} | {
    type: 'END_TURN';
} | {
    type: 'END_GAME';
    payload: {
        winner: string;
    };
} | {
    type: 'SYNC_SERVER_STATE';
    payload: GameState;
} | {
    type: 'START_ORDER_DECISION';
    payload: {
        players: string[];
    };
} | {
    type: 'ORDER_DECISION_RESULT';
    payload: {
        firstPlayer: string;
        secondPlayer: string;
        order: string[];
    };
} | {
    type: 'UPDATE_ORDER_CONFIRMATIONS';
    payload: {
        confirmations: string[];
        waitingFor: string[];
    };
} | {
    type: 'PLAY_SECRET';
    payload: {
        playerId: string;
        cardId: string;
    };
} | {
    type: 'PLAY_TRADE_OFF';
    payload: {
        playerId: string;
        cardIds: string[];
    };
} | {
    type: 'INITIATE_GIFT';
    payload: {
        playerId: string;
        cardIds: string[];
    };
} | {
    type: 'RESOLVE_GIFT';
    payload: {
        playerId: string;
        chosenCardId: string;
    };
} | {
    type: 'INITIATE_COMPETITION';
    payload: {
        playerId: string;
        groups: string[][];
    };
} | {
    type: 'RESOLVE_COMPETITION';
    payload: {
        playerId: string;
        chosenGroupIndex: number;
    };
} | {
    type: 'COMPLETE_ROUND';
};
export interface RoomInfo {
    roomId: string;
    players: string[];
    maxPlayers: number;
    gameState: 'waiting' | 'playing' | 'ended';
}
export type WebSocketEventType = 'GAME_STATE_SYNC' | 'ORDER_DECISION_STARTED' | 'ORDER_DECISION_COMPLETED' | 'TURN_CHANGED' | 'PLAYER_JOINED' | 'ERROR' | 'ORDER_DECISION_START' | 'GAME_STARTED' | 'GAME_STATE_UPDATED' | 'GAME_STATE_UPDATE' | 'ORDER_CONFIRMATION_UPDATE' | 'ORDER_CONFIRMATIONS_UPDATED' | 'PLAYER_LEFT' | 'ORDER_DECISION_RESULT' | 'TURN_ENDED' | 'GAME_ENDED' | 'ROOM_CREATED' | 'ORDER_CONFIRMED' | 'STATE_CHANGED' | 'DEAL_ANIMATION' | 'CARD_DRAWN' | 'ACTION_EXECUTED' | 'PENDING_INTERACTION' | 'INTERACTION_RESOLVED' | 'ROUND_COMPLETE';
export interface WebSocketMessage<T = any> {
    type: WebSocketEventType | string;
    payload: T;
}
export interface GameStartedPayload {
    gameState: GameState;
    message?: string;
}
export interface PlayerJoinedPayload {
    player: Player;
    gameState: GameState;
}
export interface OrderDecisionStartPayload {
    players: string[];
    gameState: GameState;
}
export interface OrderDecisionResultPayload {
    firstPlayer: string;
    secondPlayer: string;
    order: string[];
    gameState?: GameState;
}
export interface ErrorPayload {
    code: string;
    message: string;
    details?: any;
}
