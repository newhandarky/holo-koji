export type PlayerId = 'player1' | 'player2';

// 藝妓狀態
export interface Geisha {
    id: number;                     // 識別 ID
    name: string;                   // 藝妓名稱
    charmPoints: number;            // 魅力值
    controlledBy: PlayerId | null; // 控制方
}

// 物品卡片
export interface ItemCard {
    id: string;                     // 唯一識別
    geishaId: number;               // 對應藝妓 ID
    type: string;                   // 卡片類型（文字描述）
}

export type ActionType = 'secret' | 'trade-off' | 'gift' | 'competition';

// 玩家可使用的行動標誌
export interface ActionToken {
    type: ActionType; // 行動種類
    used: boolean;                 // 是否已使用
}

// 玩家資料
export interface Player {
    id: string;                     // 玩家 ID
    name: string;                   // 玩家名稱
    hand: ItemCard[];               // 手牌
    playedCards: ItemCard[];        // 已打出的卡片
    secretCards: ItemCard[];        // 秘密保留卡片
    discardedCards: ItemCard[];     // 棄置的卡片
    actionTokens: ActionToken[];    // 行動標誌陣列
}

// 遊戲整體狀態
export interface GameState {
    gameId: string;                 // 遊戲 ID
    players: Player[];              // 參與玩家
    geishas: Geisha[];              // 藝妓狀態
    currentPlayer: number;          // 當前玩家索引 (0/1)
    phase: 'waiting' | 'playing' | 'scoring' | 'ended'; // 遊戲階段
    round: number;                  // 回合數
    winner: string | null;          // 勝利者 ID
}

// 定義可 dispatch 的動作
export type GameAction =
    | { type: 'INIT_GAME'; payload: { gameId: string; players: Player[] } }
    | { type: 'DRAW_CARD'; payload: { playerId: string; card: ItemCard } }
    | { type: 'PLAY_ACTION'; payload: { playerId: string; action: ActionToken; cards: ItemCard[] } }
    | { type: 'END_TURN' }
    | { type: 'SCORE_ROUND' }
    | { type: 'END_GAME'; payload: { winner: string } };

// 房間資訊（若需要額外管理大廳狀態）
export interface RoomInfo {
    roomId: string;
    players: string[];              // 玩家 ID 陣列
    maxPlayers: number;             // 房間上限
    gameState: 'waiting' | 'playing' | 'ended';
}
