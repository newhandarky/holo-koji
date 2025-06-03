export interface Geisha {
    id: number
    name: string
    score: number  // 2~5分
}

export interface UserInfo {
    socketId: string
    userId: string
    username: string
    joinTime: number
}

export interface GameState {
    phase: string,
    round: number,
    geishas: Geisha[],
    table: Table,
    players: Record<string, HanamikojiPlayerState>,
    currentPlayer: string, // 由房主先開始
    availableActions: [1, 2, 3, 4]
}

export interface GameRoom {
    roomId: string
    users: UserInfo[]
    createdAt: number
    gameState?: GameState  // 遊戲狀態
}

// 玩家狀態
export interface HanamikojiPlayerState {
    userId: string
    username: string
    hand: Card[]
    actionsUsed: number[]         // 已用過的行動編號（1~4）
    revealed: Card[]              // 已公開的卡牌
    protected: Card[]             // 被保留的卡牌
    discarded: Card[]             // 已棄掉的卡牌
}

// players 應該是 Record<userId, HanamikojiPlayerState>
export type Players = Record<string, HanamikojiPlayerState>

export interface Card {
    geishaId: number
    cardId: string
}

export type Table = {
    [geishaId: number]: {
        [userId: string]: Card[]
    }
}

// 遊戲階段
export type HanamikojiPhase = 'waiting' | 'playing' | 'round_end' | 'finished'

// 遊戲總狀態
export interface HanamikojiGameState {
    phase: HanamikojiPhase
    round: number
    geishas: Geisha[]
    table: {
        [geishaId: number]: {
            [userId: string]: Card[] // 每位玩家在每位藝伎旁的牌
        }
    }
    players: Record<string, HanamikojiPlayerState>
    currentPlayer: string // userId
    availableActions: number[] // 當前可用行動（1~4）
    winner?: string // userId
}
