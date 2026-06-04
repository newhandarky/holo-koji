import { GameState, Geisha, GeishaSet, ItemCard } from '@newhandarky/hanakoji-game-types';
import { ItemIconDefinition, getItemIconDefinitionByPosition } from '../../utils/gameData';
import { MotionCue } from './gameMotion';

export interface PlayerBoardContext {
    currentPlayer: GameState['players'][number] | undefined;
    myState: GameState['players'][number] | undefined;
    opponentState: GameState['players'][number] | null;
    isMyTurn: boolean;
    isOpeningHandInteractionBlocked: boolean;
}

export interface BoardMotionCuePartitions {
    boardMotionCues: MotionCue[];
    handMotionCues: MotionCue[];
    competitionResultMotionActive: boolean;
}

export const buildPlayerBoardContext = (
    state: GameState,
    playerId: string,
    canAct: boolean,
    isOpeningHandInteractionBlocked: boolean
): PlayerBoardContext => {
    const currentPlayer = state.players[state.currentPlayer];
    const myState = state.players.find((player) => player.id === playerId);
    const opponentState = state.players.find((player) => player.id !== playerId) ?? null;

    return {
        currentPlayer,
        myState,
        opponentState,
        isMyTurn: canAct && currentPlayer?.id === playerId,
        isOpeningHandInteractionBlocked
    };
};

export const buildPlayedCardCountMap = (cards: ItemCard[] | undefined): Map<number, number> => {
    const map = new Map<number, number>();
    cards?.forEach((card) => {
        map.set(card.geishaId, (map.get(card.geishaId) ?? 0) + 1);
    });
    return map;
};

export const sortGeishasForBoard = (geishas: Geisha[]): Geisha[] => (
    [...geishas].sort((left, right) => {
        if (left.charmPoints !== right.charmPoints) {
            return left.charmPoints - right.charmPoints;
        }

        const leftSlotOrder = left.boardSlotId ?? left.id;
        const rightSlotOrder = right.boardSlotId ?? right.id;
        return leftSlotOrder - rightSlotOrder;
    })
);

export const buildGeishaItemIconMap = (
    orderedGeishas: Geisha[],
    activeGeishaSet: GeishaSet
): Map<number, ItemIconDefinition> => {
    const map = new Map<number, ItemIconDefinition>();

    orderedGeishas.forEach((geisha, index) => {
        const positionIndex = geisha.boardSlotId ?? index + 1;
        map.set(geisha.id, getItemIconDefinitionByPosition(positionIndex, activeGeishaSet));
    });

    return map;
};

export const buildCharmLookup = (geishas: Geisha[]): ((geishaId: number) => number) => {
    const charmMap = new Map<number, number>();
    geishas.forEach((geisha) => {
        charmMap.set(geisha.id, geisha.charmPoints);
    });
    return (geishaId: number) => charmMap.get(geishaId) ?? 0;
};

export const partitionBoardMotionCues = (motionCues: MotionCue[]): BoardMotionCuePartitions => ({
    boardMotionCues: motionCues.filter((cue) => cue.targetZone === 'board' && typeof cue.targetGeishaId === 'number'),
    handMotionCues: motionCues.filter((cue) => cue.targetZone === 'hand'),
    competitionResultMotionActive: motionCues.some((cue) => cue.kind === 'competition-result')
});
