import type { ActionToken, ItemCard, Player } from '@newhandarky/hanakoji-game-types';

export type ReplayActionType = 'secret' | 'trade-off' | null;

interface GameRoomReplayModelOptions {
    currentPlayer?: Player | null;
    currentPlayerId: string;
    expandedInfoReplayAction: ReplayActionType;
}

export interface GameRoomReplayModel {
    replayCardsByAction: Record<'secret' | 'trade-off', ItemCard[]>;
    activeReplayCards: ItemCard[];
    isReplayEligible: (playerId: string, actionType: ActionToken['type']) => boolean;
}

export const buildGameRoomReplayModel = ({
    currentPlayer,
    currentPlayerId,
    expandedInfoReplayAction
}: GameRoomReplayModelOptions): GameRoomReplayModel => {
    const actionTokenMap = new Map((currentPlayer?.actionTokens ?? []).map((token) => [token.type, token]));
    const replayCardsByAction: Record<'secret' | 'trade-off', ItemCard[]> = {
        secret: currentPlayer?.secretCards ?? [],
        'trade-off': currentPlayer?.discardedCards ?? []
    };
    const activeReplayCards = expandedInfoReplayAction ? replayCardsByAction[expandedInfoReplayAction] : [];

    return {
        replayCardsByAction,
        activeReplayCards,
        isReplayEligible: (playerId: string, actionType: ActionToken['type']) => {
            if (playerId !== currentPlayerId || (actionType !== 'secret' && actionType !== 'trade-off')) {
                return false;
            }
            const token = actionTokenMap.get(actionType);
            return Boolean(token?.used && replayCardsByAction[actionType].length > 0);
        }
    };
};
