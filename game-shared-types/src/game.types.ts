export type PlayerId = 'player1' | 'player2';

// 藝妓狀態
export interface Geisha {
    id: number;                     // 識別 ID
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
    offeredCards: ItemCard[];
}

export interface PendingCompetitionInteraction {
    type: 'COMPETITION_SELECTION';
    initiatorId: string;
    targetPlayerId: string;
    groups: ItemCard[][];
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

export type GeishaSet = 'default' | 'akatsuki' | 'onesan' | 'collaboration';

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
