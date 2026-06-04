import {
    ErrorPayload,
    GameState,
    ItemCard,
    OrderDecisionResultPayload,
    OrderDecisionStartPayload,
    ReadyStatusPayload
} from '@newhandarky/hanakoji-game-types';

export interface CardDrawEvent {
    // 抽牌玩家 ID
    playerId: string;
    // 抽到的卡片
    card: ItemCard;
}

export interface DealAnimationEvent {
    sequence: Array<{
        order: number;
        playerId: string;
        card: ItemCard;
    }>;
}

export interface RoundCompletePayload {
    // 結算回合數
    round?: number;
}

export interface NormalizedErrorPayload {
    code?: string;
    message: string;
}

// 解析廣播 payload 中的 GameState，確保型別安全
export const resolveGameStatePayload = (payload: unknown): GameState | null => {
    if (!payload || typeof payload !== 'object') {
        return null;
    }

    if ('gameState' in payload && (payload as { gameState: GameState }).gameState) {
        return (payload as { gameState: GameState }).gameState;
    }

    if ('gameId' in payload && 'players' in payload) {
        return payload as GameState;
    }

    return null;
};

// 讀取順序決定事件中的玩家列表
export const orderDecisionPlayers = (payload: unknown): string[] => {
    if (!payload || typeof payload !== 'object') {
        return [];
    }

    if ('players' in payload && Array.isArray((payload as OrderDecisionStartPayload).players)) {
        return (payload as OrderDecisionStartPayload).players;
    }

    return [];
};

// 讀取順序決定結果（允許缺少 gameState）
export const orderDecisionResult = (payload: unknown): OrderDecisionResultPayload | null => {
    if (!payload || typeof payload !== 'object') {
        return null;
    }

    const candidate = payload as Partial<OrderDecisionResultPayload>;
    if (candidate.firstPlayer && candidate.secondPlayer && Array.isArray(candidate.order)) {
        const result: OrderDecisionResultPayload = {
            firstPlayer: candidate.firstPlayer,
            secondPlayer: candidate.secondPlayer,
            order: candidate.order,
            gameState: candidate.gameState
        };
        if (!candidate.gameState) {
            delete result.gameState;
        }
        return result;
    }

    return null;
};

export const orderConfirmationUpdate = (payload: unknown): { confirmations: string[]; waitingFor: string[] } | null => {
    if (!payload || typeof payload !== 'object') {
        return null;
    }

    const candidate = payload as { confirmations?: unknown; waitingFor?: unknown };
    return {
        confirmations: Array.isArray(candidate.confirmations) ? (candidate.confirmations as string[]) : [],
        waitingFor: Array.isArray(candidate.waitingFor) ? (candidate.waitingFor as string[]) : []
    };
};

export const normalizeErrorPayload = (payload: unknown): NormalizedErrorPayload => {
    const errorPayload = payload && typeof payload === 'object'
        ? payload as Partial<ErrorPayload>
        : null;
    const message = typeof payload === 'string'
        ? payload
        : (errorPayload && typeof errorPayload.message === 'string')
            ? errorPayload.message
            : '未知錯誤';

    return {
        code: errorPayload?.code,
        message
    };
};

export const cardDrawEvent = (payload: unknown): CardDrawEvent | null => {
    if (!payload || typeof payload !== 'object') {
        return null;
    }

    const candidate = payload as Partial<CardDrawEvent> & { card?: ItemCard };
    if (typeof candidate.playerId === 'string' && candidate.card && typeof candidate.card === 'object') {
        return {
            playerId: candidate.playerId,
            card: candidate.card
        };
    }

    return null;
};

export const dealAnimationEvent = (payload: unknown): DealAnimationEvent | null => {
    if (!payload || typeof payload !== 'object') {
        return null;
    }

    const candidate = payload as Partial<DealAnimationEvent>;
    if (!Array.isArray(candidate.sequence)) {
        return null;
    }

    const sequence = candidate.sequence.filter((step): step is DealAnimationEvent['sequence'][number] => (
        Boolean(step)
        && typeof step === 'object'
        && typeof step.order === 'number'
        && typeof step.playerId === 'string'
        && Boolean(step.card)
        && typeof step.card === 'object'
    ));

    if (sequence.length === 0) {
        return null;
    }

    return { sequence };
};

export const roundCompletePayload = (payload: unknown): RoundCompletePayload | null => {
    if (!payload || typeof payload !== 'object') {
        return null;
    }

    const round = (payload as RoundCompletePayload).round;
    if (!round) {
        return null;
    }

    return { round };
};

export const readyStatusPayload = (payload: unknown): ReadyStatusPayload | null => {
    if (!payload || typeof payload !== 'object') {
        return null;
    }

    return payload as ReadyStatusPayload;
};
