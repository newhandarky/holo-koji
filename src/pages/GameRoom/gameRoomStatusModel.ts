import type { GameState } from '@newhandarky/hanakoji-game-types';

interface GameRoomStatusModelOptions {
    state: GameState;
    currentPlayerId: string;
    isOpeningDealActive: boolean;
    isOpeningHandRevealBlocking: boolean;
    hasRoundSummary: boolean;
    hasReadyStatus: boolean;
}

export interface GameRoomStatusModel {
    isGameEnded: boolean;
    isWaiting: boolean;
    isMyTurn: boolean;
    isInteractionLocked: boolean;
    canAct: boolean;
    needsResponse: boolean;
    activeTurnPlayerId?: string;
}

export const buildGameRoomStatusModel = ({
    state,
    currentPlayerId,
    isOpeningDealActive,
    isOpeningHandRevealBlocking,
    hasRoundSummary,
    hasReadyStatus
}: GameRoomStatusModelOptions): GameRoomStatusModel => {
    const pendingInteraction = state.pendingInteraction ?? null;
    const activeTurnPlayerId = state.players[state.currentPlayer]?.id;
    const isGameEnded = state.phase === 'ended';
    const isWaiting = state.phase === 'waiting' || state.players.length < 2;
    const isMyTurn = activeTurnPlayerId === currentPlayerId;
    const needsResponse = pendingInteraction?.targetPlayerId === currentPlayerId;
    const isInteractionLocked = Boolean(pendingInteraction)
        || isOpeningDealActive
        || isOpeningHandRevealBlocking
        || state.orderDecision.isOpen
        || hasRoundSummary
        || hasReadyStatus
        || isGameEnded;
    const canAct =
        state.phase === 'playing'
        && isMyTurn
        && !pendingInteraction
        && !isOpeningDealActive
        && !isOpeningHandRevealBlocking
        && !state.orderDecision.isOpen;

    return {
        isGameEnded,
        isWaiting,
        isMyTurn,
        isInteractionLocked,
        canAct,
        needsResponse,
        activeTurnPlayerId
    };
};
