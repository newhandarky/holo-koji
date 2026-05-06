export type PlayerId = 'player1' | 'player2';

// 藝妓狀態
export interface Geisha {
    id: number;                     // 識別 ID
    characterId?: string;           // 角色資料識別
    boardSlotId?: number;           // 場上位置識別
    name: string;                   // 藝妓名稱
    charmPoints: number;            // 魅力值
    imageUrl: string;               // 顯示用人物圖片 URL
    controlledBy: PlayerId | null; // 控制方
}

// 物品卡片
export interface ItemCard {
    id: string;                     // 唯一識別
    geishaId: number;               // 對應藝妓 ID
    type: string;                   // 卡片類型（文字描述）
    boardSlotId?: number;           // 對應場上位置
    itemAssetName?: string;         // 穩定內部道具名稱
    itemLabel?: string;             // 顯示用道具名稱
    itemImageUrl?: string;          // 顯示用道具圖片
    itemIconUrl?: string;           // 顯示用道具 icon
}

export type ActionType = 'secret' | 'trade-off' | 'gift' | 'competition';

export type GamePhase = 'waiting' | 'deciding_order' | 'playing' | 'resolution' | 'ended';


// 玩家可使用的行動標誌
export interface ActionToken {
    type: ActionType; // 行動種類
    used: boolean;                 // 是否已使用
}

// 玩家資料
export interface Player {
    id: string;                     // 玩家 ID
    name: string;                   // 玩家名稱
    lineUserId?: string;            // LINE 使用者 ID
    avatarUrl?: string;             // LINE 頭像
    hand: ItemCard[];               // 手牌
    playedCards: ItemCard[];        // 已打出的卡片
    secretCards: ItemCard[];        // 秘密保留卡片
    discardedCards: ItemCard[];     // 棄置的卡片
    actionTokens: ActionToken[];    // 行動標誌陣列
    score: {
        charm: number;              // 目前魅力分數總和
        tokens: number;             // 目前擁有的藝妓數量
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

export type GeishaSet = 'default' | 'collaboration' | 'hololive';
export type RoomSetupMode = 'random' | 'custom';

export interface CharacterProfile {
    characterId: string;
    name: string;
    imageUrl: string;
}

export const characterProfilesBySet: Record<GeishaSet, CharacterProfile[]> = {
    default: [
        {
            characterId: 'ginza-ema',
            name: 'エマ',
            imageUrl: 'https://pub-0238f59b333e4bf38dac0e35da86c1a0.r2.dev/uploads/%E9%8A%80%E5%BA%A7/1777611017157-376855dd-16ba-4292-8d0c-2e79e278e241-kabuki03.png'
        },
        {
            characterId: 'ginza-rio',
            name: 'リオ',
            imageUrl: 'https://pub-0238f59b333e4bf38dac0e35da86c1a0.r2.dev/uploads/%E9%8A%80%E5%BA%A7/1777611017083-2ee9140e-907f-45ff-8e78-acaf476fe4e3-kabuki05.png'
        },
        {
            characterId: 'ginza-aya',
            name: 'アヤ',
            imageUrl: 'https://pub-0238f59b333e4bf38dac0e35da86c1a0.r2.dev/uploads/%E9%8A%80%E5%BA%A7/1777611017067-cdc6ebba-23b6-497b-a835-1dc221078c42-kabuki09.png'
        },
        {
            characterId: 'ginza-noa',
            name: 'ノア',
            imageUrl: 'https://pub-0238f59b333e4bf38dac0e35da86c1a0.r2.dev/uploads/%E9%8A%80%E5%BA%A7/1777611016888-54e667d9-47fe-416c-8909-46b6a9ac2b83-kabuki01.png'
        },
        {
            characterId: 'ginza-reina',
            name: 'レイナ',
            imageUrl: 'https://pub-0238f59b333e4bf38dac0e35da86c1a0.r2.dev/uploads/%E9%8A%80%E5%BA%A7/1777611017071-a06dabd4-643a-4f0c-a36c-ec9a22bde9e8-kabuki02.png'
        },
        {
            characterId: 'ginza-misaki',
            name: 'ミサキ',
            imageUrl: 'https://pub-0238f59b333e4bf38dac0e35da86c1a0.r2.dev/uploads/%E9%8A%80%E5%BA%A7/1777611016880-7e3fe2d2-25c3-4552-89c6-d67a6d5c238e-kabuki06.png'
        },
        {
            characterId: 'ginza-core',
            name: 'コア',
            imageUrl: 'https://pub-0238f59b333e4bf38dac0e35da86c1a0.r2.dev/uploads/%E9%8A%80%E5%BA%A7/1777611016892-c373732f-4f9b-4f79-b05d-ae92fec06aec-kabuki07.png'
        }
    ],
    collaboration: [
        {
            characterId: 'collaboration-luminous',
            name: 'ルミナス',
            imageUrl: 'https://pub-0238f59b333e4bf38dac0e35da86c1a0.r2.dev/uploads/collaboration/1777794154619-56c08d44-f761-4428-880a-cb06b18910cd-file_00000000c60c7206a4b1990a0851cb55.png'
        },
        {
            characterId: 'collaboration-marin',
            name: 'マリン',
            imageUrl: 'https://pub-0238f59b333e4bf38dac0e35da86c1a0.r2.dev/uploads/collaboration/1777794154619-238b4ede-9ef9-4f61-950c-6c50403d8257-file_0000000058a07206a98b78b3d163bfcd.png'
        },
        {
            characterId: 'collaboration-tifa',
            name: 'ティファ',
            imageUrl: 'https://pub-0238f59b333e4bf38dac0e35da86c1a0.r2.dev/uploads/collaboration/1777794154619-8ddec58e-ea92-4c9d-af97-19514673171b-file_000000002f187206886a7c5acecdee75.png'
        },
        {
            characterId: 'collaboration-yoru',
            name: 'ヨル',
            imageUrl: 'https://pub-0238f59b333e4bf38dac0e35da86c1a0.r2.dev/uploads/collaboration/1777794154619-7f0123f1-c2be-4b50-869d-628bddbb482a-file_0000000051987206ab4b8bde70c394ef.png'
        },
        {
            characterId: 'collaboration-frieren',
            name: 'フリーレン',
            imageUrl: 'https://pub-0238f59b333e4bf38dac0e35da86c1a0.r2.dev/uploads/collaboration/1777794154619-2fb6f6b3-ecab-4416-90ac-54f6588f2937-file_000000009c307206a4d10253a66bf32f.png'
        },
        {
            characterId: 'collaboration-eren',
            name: 'エレン',
            imageUrl: 'https://pub-0238f59b333e4bf38dac0e35da86c1a0.r2.dev/uploads/collaboration/1777794154619-a3648bc0-6ec9-4117-880b-924f42d7c236-file_00000000c6247206a5742e41defbde0f.png'
        },
        {
            characterId: 'collaboration-kana',
            name: 'カナ',
            imageUrl: 'https://pub-0238f59b333e4bf38dac0e35da86c1a0.r2.dev/uploads/collaboration/1777794154619-d077efe6-08b4-4b81-a02f-502e797d806c-file_000000001df07206bf1223c321c9bf7a.png'
        }
    ],
    hololive: [
        {
            characterId: 'hololive-raden',
            name: 'らでん',
            imageUrl: 'https://pub-0238f59b333e4bf38dac0e35da86c1a0.r2.dev/uploads/Hololive/1777794137243-870d562f-9a2e-4471-9d76-704e231df3c9-file_00000000c194720b81f3969b36b95484.png'
        },
        {
            characterId: 'hololive-iroha',
            name: 'いろは',
            imageUrl: 'https://pub-0238f59b333e4bf38dac0e35da86c1a0.r2.dev/uploads/Hololive/1777794137243-0a5115ff-843a-4043-b069-f90f61d99824-file_00000000dda87209ab63fecafbdc7cfd.png'
        },
        {
            characterId: 'hololive-miko',
            name: 'みこ',
            imageUrl: 'https://pub-0238f59b333e4bf38dac0e35da86c1a0.r2.dev/uploads/Hololive/1777794137243-17ad4fcd-f518-44f4-a93d-655776a74d00-file_000000002d94720688fd6c67e1d8749c.png'
        },
        {
            characterId: 'hololive-fubuki',
            name: 'フブキ',
            imageUrl: 'https://pub-0238f59b333e4bf38dac0e35da86c1a0.r2.dev/uploads/Hololive/1777794137243-5a1815e4-78af-400a-b5a2-0f35e7b9abc0-file_000000008c28720b8eb6186b7c86f52e.png'
        },
        {
            characterId: 'hololive-ayame',
            name: 'あやめ',
            imageUrl: 'https://pub-0238f59b333e4bf38dac0e35da86c1a0.r2.dev/uploads/Hololive/1777794137243-2e69c96b-6ad6-482c-bf82-828b49ae0155-file_00000000e14c7206ab928a762d56dc8e.png'
        },
        {
            characterId: 'hololive-ina',
            name: 'イナ',
            imageUrl: 'https://pub-0238f59b333e4bf38dac0e35da86c1a0.r2.dev/uploads/Hololive/1777794137243-928dbf84-5ab8-47c8-9fc3-149eb244bbba-file_0000000049dc720993f8369365f8d807.png'
        },
        {
            characterId: 'hololive-mio',
            name: 'ミオ',
            imageUrl: 'https://pub-0238f59b333e4bf38dac0e35da86c1a0.r2.dev/uploads/Hololive/1777794137243-54af5189-1e09-4fee-b226-4c533447cd89-file_0000000006c472098493cdc541a91abb.png'
        }
    ]
};

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
    geishaSet?: GeishaSet;
    setupMode?: RoomSetupMode;
    customSelection?: CustomCharacterSelection;
}

// 遊戲整體狀態
export interface GameState {
    gameId: string;
    players: Player[];
    geishas: Geisha[];
    geishaSet?: GeishaSet;
    currentPlayer: number;
    phase: GamePhase;
    round: number;
    winner?: string;
    // 新增順序決定相關狀態
    orderDecision: OrderDecision;
    drawPile: ItemCard[];
    discardPile: ItemCard[];
    removedCard?: ItemCard;
    openingDeal?: OpeningDealSummary;
    settlement?: {
        removedCard?: ItemCard;
    };
    pendingInteraction: PendingInteraction | null;
    lastAction?: {
        playerId: string;
        action: ActionType;
    };
}

// 定義可 dispatch 的動作
export type GameAction =
    | { type: 'INIT_GAME'; payload: { gameId: string; players: Player[] } }
    | { type: 'DRAW_CARD'; payload: { playerId: string; card: ItemCard } }
    | { type: 'PLAY_ACTION'; payload: { playerId: string; action: ActionToken; cards: ItemCard[] } }
    | { type: 'SCORE_ROUND'; payload: { scores: { playerId: string; points: number }[] } }
    | { type: 'END_TURN' }
    | { type: 'END_GAME'; payload: { winner: string } }
    | { type: 'SYNC_SERVER_STATE'; payload: GameState }
    // 新增順序決定相關動作
    | { type: 'START_ORDER_DECISION'; payload: { players: string[] } }
    | { type: 'ORDER_DECISION_RESULT'; payload: { firstPlayer: string; secondPlayer: string; order: string[] } }
    | { type: 'UPDATE_ORDER_CONFIRMATIONS'; payload: { confirmations: string[]; waitingFor: string[] } }
    | { type: 'PLAY_SECRET'; payload: { playerId: string; cardId: string } }
    | { type: 'PLAY_TRADE_OFF'; payload: { playerId: string; cardIds: string[] } }
    | { type: 'INITIATE_GIFT'; payload: { playerId: string; cardIds: string[] } }
    | { type: 'RESOLVE_GIFT'; payload: { playerId: string; chosenCardId: string } }
    | { type: 'INITIATE_COMPETITION'; payload: { playerId: string; groups: string[][] } }
    | { type: 'RESOLVE_COMPETITION'; payload: { playerId: string; chosenGroupIndex: number } }
    | { type: 'COMPLETE_ROUND' };


// 房間資訊（若需要額外管理大廳狀態）
export interface RoomInfo {
    roomId: string;
    players: string[];              // 玩家 ID 陣列
    maxPlayers: number;             // 房間上限
    gameState: 'waiting' | 'playing' | 'ended';
}

export type WebSocketEventType =
    // 狀態通知（過去式/完成式）
    | 'GAME_STATE_SYNC'           // 同步遊戲狀態
    | 'ORDER_DECISION_STARTED'    // 順序決定已開始
    | 'ORDER_DECISION_COMPLETED'  // 順序決定已完成
    | 'TURN_CHANGED'             // 回合已改變
    | 'PLAYER_JOINED'            // 玩家已加入
    | 'ERROR'                    // 錯誤發生
    | 'ORDER_DECISION_START'
    | 'GAME_STARTED'
    | 'GAME_STATE_UPDATED'
    | 'GAME_STATE_UPDATE'
    | 'ORDER_CONFIRMATION_UPDATE'
    | 'ORDER_CONFIRMATIONS_UPDATED'
    | 'PLAYER_LEFT'
    | 'ORDER_DECISION_RESULT'
    | 'TURN_ENDED'
    | 'GAME_ENDED'
    | 'ROOM_CREATED'
    | 'ORDER_CONFIRMED'
    | 'STATE_CHANGED'
    | 'DEAL_ANIMATION'
    | 'CARD_DRAWN'
    | 'ACTION_EXECUTED'
    | 'PENDING_INTERACTION'
    | 'INTERACTION_RESOLVED'
    | 'ROUND_COMPLETE';

export interface WebSocketMessage<T = any> {
    type: WebSocketEventType | string;
    payload: T;
}

// 特定事件的 payload 型別
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
